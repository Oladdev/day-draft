/**
 * Zustand Store — Central state for Day Draft
 *
 * Persisted to localStorage with automatic v3 migration.
 * Fixes stale-date bug by re-evaluating date on initialization.
 * Fixes board ↔ task status synchronization bug.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  ScheduleItem,
  Task,
  TaskStatus,
  RecurrenceOverride,
  Category,
  BoardColumn,
  Settings,
  FocusSession,
  View,
} from './lib/types'
import { uid } from './lib/id'
import { todayISO } from './lib/time'
import { parseShortSyntax } from './lib/parse'
import {
  pushItemToCloud,
  deleteItemFromCloud,
  pushTaskToCloud,
  deleteTaskFromCloud,
} from './lib/sync'

export interface UserProfile {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

export interface AppState {
  // Domain data
  items: ScheduleItem[]
  tasks: Task[]
  overrides: RecurrenceOverride[]
  categories: Category[]
  boardColumns: BoardColumn[]
  settings: Settings

  // User Profile & Storage status
  user: UserProfile | null
  syncStatus: 'synced' | 'syncing' | 'offline'
  lastSyncedAt: number | null
  userModalOpen: boolean

  // Active navigation & session
  view: View
  date: string // active date viewed
  focusSession: FocusSession | null
  captureOpen: boolean
  addSheetOpen: boolean
  endOfDayOpen: boolean
  editModalItem: { item: ScheduleItem | Task; itemType: 'schedule' | 'task' } | null

  // Nav & Modal actions
  setView: (v: View) => void
  setDate: (d: string) => void
  setCapture: (open: boolean) => void
  setAddSheet: (open: boolean) => void
  setEndOfDay: (open: boolean) => void
  setUserModalOpen: (open: boolean) => void
  setEditModalItem: (item: { item: ScheduleItem | Task; itemType: 'schedule' | 'task' } | null) => void

  // User & Sync actions
  login: (name: string, email: string) => void
  logout: () => void
  triggerSync: () => void
  importData: (jsonData: string) => boolean

  // ScheduleItem CRUD
  addItem: (item: Omit<ScheduleItem, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => string
  updateItem: (id: string, patch: Partial<ScheduleItem>) => void
  removeItem: (id: string) => void

  // Recurrence Overrides
  skipOccurrence: (itemId: string, date: string) => void
  rescheduleOccurrence: (itemId: string, date: string, newStartTime: string, newDuration: number) => void
  clearOverride: (itemId: string, date: string) => void

  // Task CRUD
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'columnId' | 'boardOrder'> & { columnId?: string }) => string
  quickCaptureTask: (rawText: string) => string
  updateTask: (id: string, patch: Partial<Task>) => void
  removeTask: (id: string) => void
  toggleTask: (id: string) => void
  planTask: (id: string, date?: string) => void

  // Board
  moveTaskToColumn: (taskId: string, targetColumnId: string, newOrder?: number) => void
  addColumn: (title: string) => void
  removeColumn: (id: string) => void

  // Focus Sessions
  startFocus: (targetId: string, targetType: 'item' | 'task', targetTitle: string, plannedMin: number) => void
  stopFocus: () => void

  // Settings & Onboarding
  updateSettings: (patch: Partial<Settings>) => void
  completeOnboarding: () => void
  resetToSampleData: () => void
}

const DEFAULT_BOARD_COLUMNS: BoardColumn[] = [
  { id: 'backlog', title: 'Task Inbox', order: 0 },
  { id: 'week', title: 'This Week', order: 1 },
  { id: 'doing', title: 'In Progress', order: 2 },
  { id: 'done', title: 'Done', order: 3 },
]

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-classes', name: 'Academics', color: 'emerald', icon: '📚' },
  { id: 'cat-dev', name: 'Programming', color: 'teal', icon: '💻' },
  { id: 'cat-reading', name: 'Reading', color: 'sky', icon: '📖' },
  { id: 'cat-meetings', name: 'Meetings', color: 'rose', icon: '👥' },
  { id: 'cat-routine', name: 'Daily Habits', color: 'amber', icon: '⚡' },
]

const DEFAULT_SETTINGS: Settings = {
  dayStart: 360, // 6:00 AM
  dayEnd: 1380, // 11:00 PM
  targetFreeMin: 120, // 2 hours free time goal
  endOfDayReviewAt: 1320, // 10:00 PM
  onboardingComplete: false,
}

const now = () => Date.now()

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      items: [],
      tasks: [],
      overrides: [],
      categories: DEFAULT_CATEGORIES,
      boardColumns: DEFAULT_BOARD_COLUMNS,
      settings: DEFAULT_SETTINGS,

      // User & Local Storage
      user: null,
      syncStatus: 'offline',
      lastSyncedAt: Date.now(),
      userModalOpen: false,
      editModalItem: null,

      view: 'today',
      date: todayISO(),
      focusSession: null,
      captureOpen: false,
      addSheetOpen: false,
      endOfDayOpen: false,

      setView: (v) => set({ view: v }),
      setDate: (d) => set({ date: d }),
      setCapture: (open) => set({ captureOpen: open }),
      setAddSheet: (open) => set({ addSheetOpen: open }),
      setEndOfDay: (open) => set({ endOfDayOpen: open }),
      setUserModalOpen: (open) => set({ userModalOpen: open }),
      setEditModalItem: (item) => set({ editModalItem: item }),

      login: (name, email) =>
        set({
          user: { id: uid(), name: name.trim(), email: email.trim() },
          syncStatus: 'synced',
          lastSyncedAt: Date.now(),
          userModalOpen: false,
        }),

      logout: () => set({ user: null, syncStatus: 'offline', userModalOpen: false }),

      triggerSync: () => {
        // Honest local storage touch
        set({ syncStatus: 'synced', lastSyncedAt: Date.now() })
      },

      importData: (jsonData: string) => {
        try {
          const parsed = JSON.parse(jsonData)
          if (!parsed || typeof parsed !== 'object') return false
          
          set((s) => ({
            items: Array.isArray(parsed.items) ? parsed.items : s.items,
            tasks: Array.isArray(parsed.tasks) ? parsed.tasks : s.tasks,
            overrides: Array.isArray(parsed.overrides) ? parsed.overrides : s.overrides,
            settings: parsed.settings ? { ...s.settings, ...parsed.settings } : s.settings,
            lastSyncedAt: Date.now(),
          }))
          return true
        } catch (e) {
          console.error('Import failed', e)
          return false
        }
      },

      // ── Schedule Items ──
      addItem: (item) => {
        const id = uid()
        const newItem: ScheduleItem = {
          ...item,
          id,
          createdAt: now(),
          updatedAt: now(),
          version: 1,
        }
        set((s) => ({ items: [...s.items, newItem], lastSyncedAt: now() }))
        const user = get().user
        if (user) pushItemToCloud(newItem, user.id)
        return id
      },

      updateItem: (id, patch) => {
        set((s) => {
          const nextItems = s.items.map((it) =>
            it.id === id ? { ...it, ...patch, updatedAt: now(), version: it.version + 1 } : it
          )
          const updated = nextItems.find((it) => it.id === id)
          if (updated && s.user) pushItemToCloud(updated, s.user.id)
          return { items: nextItems, lastSyncedAt: now() }
        })
      },

      removeItem: (id) => {
        const user = get().user
        if (user) deleteItemFromCloud(id, user.id)
        set((s) => ({
          items: s.items.filter((it) => it.id !== id),
          overrides: s.overrides.filter((o) => o.itemId !== id),
          lastSyncedAt: now(),
        }))
      },

      // ── Recurrence Overrides ──
      skipOccurrence: (itemId, date) => {
        set((s) => {
          const filtered = s.overrides.filter((o) => !(o.itemId === itemId && o.date === date))
          return {
            overrides: [
              ...filtered,
              { id: uid(), itemId, date, action: 'skip' },
            ],
            lastSyncedAt: now(),
          }
        })
      },

      rescheduleOccurrence: (itemId, date, newStartTime, newDuration) => {
        set((s) => {
          const filtered = s.overrides.filter((o) => !(o.itemId === itemId && o.date === date))
          return {
            overrides: [
              ...filtered,
              { id: uid(), itemId, date, action: 'reschedule', newStartTime, newDuration },
            ],
            lastSyncedAt: now(),
          }
        })
      },

      clearOverride: (itemId, date) => {
        set((s) => ({
          overrides: s.overrides.filter((o) => !(o.itemId === itemId && o.date === date)),
          lastSyncedAt: now(),
        }))
      },

      // ── Tasks ──
      addTask: (t) => {
        const id = uid()
        const { boardColumns, tasks, user } = get()
        const columnId = t.columnId ?? boardColumns[0]?.id ?? 'backlog'
        const boardOrder =
          Math.max(0, ...tasks.filter((x) => x.columnId === columnId).map((x) => x.boardOrder)) + 1

        const task: Task = {
          ...t,
          id,
          columnId,
          boardOrder,
          createdAt: now(),
          updatedAt: now(),
          version: 1,
        }
        set((s) => ({ tasks: [...s.tasks, task], lastSyncedAt: now() }))
        if (user) pushTaskToCloud(task, user.id)
        return id
      },

      quickCaptureTask: (rawText) => {
        const parsed = parseShortSyntax(rawText)
        return get().addTask({
          title: parsed.title,
          estimate: parsed.estimate,
          priority: parsed.priority,
          status: 'todo',
          fromCapture: true,
        })
      },

      updateTask: (id, patch) => {
        set((s) => {
          const nextTasks = s.tasks.map((t) =>
            t.id === id ? { ...t, ...patch, updatedAt: now(), version: t.version + 1 } : t
          )
          const updated = nextTasks.find((t) => t.id === id)
          if (updated && s.user) pushTaskToCloud(updated, s.user.id)
          return { tasks: nextTasks, lastSyncedAt: now() }
        })
      },

      removeTask: (id) => {
        const user = get().user
        if (user) deleteTaskFromCloud(id, user.id)
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id), lastSyncedAt: now() }))
      },

      // Fix critical bug: toggling status must sync board column!
      toggleTask: (id) => {
        set((s) => {
          const task = s.tasks.find((t) => t.id === id)
          if (!task) return s
          const isDone = task.status === 'done'
          const nextStatus: TaskStatus = isDone ? 'todo' : 'done'
          const nextColumnId = nextStatus === 'done' ? 'done' : 'doing'

          const nextTasks = s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: nextStatus,
                  columnId: nextColumnId,
                  updatedAt: now(),
                  version: t.version + 1,
                }
              : t
          )
          const updated = nextTasks.find((t) => t.id === id)
          if (updated && s.user) pushTaskToCloud(updated, s.user.id)

          return {
            tasks: nextTasks,
            lastSyncedAt: now(),
          }
        })
      },

      planTask: (id, date) => {
        set((s) => {
          const nextTasks = s.tasks.map((t) =>
            t.id === id ? { ...t, scheduledDate: date, updatedAt: now(), version: t.version + 1 } : t
          )
          const updated = nextTasks.find((t) => t.id === id)
          if (updated && s.user) pushTaskToCloud(updated, s.user.id)
          return { tasks: nextTasks, lastSyncedAt: now() }
        })
      },

      // ── Board ──
      moveTaskToColumn: (taskId, targetColumnId, newOrder) => {
        set((s) => {
          const task = s.tasks.find((t) => t.id === taskId)
          if (!task) return s
          const isTargetDone = targetColumnId === 'done'
          const nextStatus = isTargetDone ? 'done' : task.status === 'done' ? 'todo' : task.status

          const maxOrder =
            Math.max(0, ...s.tasks.filter((t) => t.columnId === targetColumnId).map((t) => t.boardOrder)) + 1
          const finalOrder = newOrder ?? maxOrder

          return {
            tasks: s.tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    columnId: targetColumnId,
                    boardOrder: finalOrder,
                    status: nextStatus,
                    updatedAt: now(),
                    version: t.version + 1,
                  }
                : t
            ),
            lastSyncedAt: now(),
          }
        })
      },

      addColumn: (title) => {
        set((s) => ({
          boardColumns: [
            ...s.boardColumns,
            { id: uid(), title: title.trim() || 'New column', order: s.boardColumns.length },
          ],
          lastSyncedAt: now(),
        }))
      },

      removeColumn: (id) => {
        set((s) => {
          const fallback = s.boardColumns.find((c) => c.id !== id)?.id ?? 'backlog'
          return {
            boardColumns: s.boardColumns.filter((c) => c.id !== id),
            tasks: s.tasks.map((t) => (t.columnId === id ? { ...t, columnId: fallback } : t)),
            lastSyncedAt: now(),
          }
        })
      },

      // ── Focus Session ──
      startFocus: (targetId, targetType, targetTitle, plannedMin) => {
        set({
          focusSession: {
            targetId,
            targetType,
            targetTitle,
            startedAt: now(),
            plannedMin,
          },
        })
      },

      stopFocus: () => set({ focusSession: null }),

      // ── Settings & Onboarding ──
      updateSettings: (patch) => {
        set((s) => ({ settings: { ...s.settings, ...patch }, lastSyncedAt: now() }))
      },

      completeOnboarding: () => {
        set((s) => ({
          settings: { ...s.settings, onboardingComplete: true },
          view: 'today',
          lastSyncedAt: now(),
        }))
      },

      resetToSampleData: () => {
        const today = todayISO()
        const sampleItems: ScheduleItem[] = [
          {
            id: uid(),
            type: 'class',
            title: 'Data Structures & Algorithms',
            startTime: '09:00',
            duration: 90,
            recurrence: { type: 'weekly', days: [1, 3, 5] }, // Mon, Wed, Fri
            location: 'Room 302',
            color: 'emerald',
            createdAt: now(),
            updatedAt: now(),
            version: 1,
          },
          {
            id: uid(),
            type: 'meeting',
            title: 'Project Team Standup',
            startTime: '13:00',
            duration: 30,
            recurrence: { type: 'weekly', days: [2, 4] }, // Tue, Thu
            location: 'Google Meet',
            color: 'teal',
            createdAt: now(),
            updatedAt: now(),
            version: 1,
          },
          {
            id: uid(),
            type: 'routine',
            title: 'Deep Coding Period',
            duration: 90,
            preferredStart: '10:45',
            preferredEnd: '13:00',
            recurrence: { type: 'daily' },
            color: 'emerald',
            notes: 'Work on Day Draft frontend & backend logic',
            createdAt: now(),
            updatedAt: now(),
            version: 1,
          },
          {
            id: uid(),
            type: 'reading',
            title: 'Clean Architecture & System Design',
            duration: 45,
            notes: 'Target: Chapter 5 (SOLID Principles in TypeScript)',
            preferredStart: '19:30',
            preferredEnd: '21:30',
            recurrence: { type: 'daily' },
            color: 'indigo',
            createdAt: now(),
            updatedAt: now(),
            version: 1,
          },
        ]

        const sampleTasks: Task[] = [
          {
            id: uid(),
            title: 'Review Chapter 5 on Graph Algorithms',
            priority: 'high',
            estimate: 45,
            status: 'todo',
            scheduledDate: today,
            columnId: 'doing',
            boardOrder: 0,
            createdAt: now(),
            updatedAt: now(),
            version: 1,
          },
          {
            id: uid(),
            title: 'Draft weekly engineering report',
            priority: 'medium',
            estimate: 30,
            status: 'todo',
            columnId: 'week',
            boardOrder: 0,
            createdAt: now(),
            updatedAt: now(),
            version: 1,
          },
          {
            id: uid(),
            title: 'Clean up Git repository branches',
            priority: 'low',
            estimate: 15,
            status: 'todo',
            columnId: 'backlog',
            boardOrder: 0,
            createdAt: now(),
            updatedAt: now(),
            version: 1,
          },
        ]

        set({
          items: sampleItems,
          tasks: sampleTasks,
          overrides: [],
          settings: { ...DEFAULT_SETTINGS, onboardingComplete: true },
          view: 'today',
          date: today,
          lastSyncedAt: now(),
        })
      },
    }),
    {
      name: 'day_draft_v3',
      storage: createJSONStorage(() => localStorage),
      version: 3,
      onRehydrateStorage: () => (state) => {
        // Fix stale-date bug: on reload, always align active view date to today
        if (state) {
          state.date = todayISO()
          if (state.boardColumns) {
            state.boardColumns = state.boardColumns.map((c) =>
              c.title === 'Backlog' ? { ...c, title: 'Task Inbox' } : c
            )
          }
        }
      },
      migrate: (persistedState: any, version) => {
        if (!persistedState || version < 3) {
          // Clean upgrade from v1/v2 to v3
          return {
            items: [],
            tasks: [],
            overrides: [],
            categories: DEFAULT_CATEGORIES,
            boardColumns: DEFAULT_BOARD_COLUMNS,
            settings: DEFAULT_SETTINGS,
            view: 'today',
            date: todayISO(),
            focusSession: null,
            captureOpen: false,
            addSheetOpen: false,
            endOfDayOpen: false,
          }
        }
        return persistedState
      },
    }
  )
)
