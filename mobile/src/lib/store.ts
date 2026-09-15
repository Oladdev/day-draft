import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  ScheduleItem,
  Task,
  RecurrenceOverride,
  Settings,
  UserProfile,
  FocusSession,
} from './types'
import { todayISO } from './time'
import { uid } from './id'
import { supabase } from './supabase'

export interface StoreState {
  items: ScheduleItem[]
  tasks: Task[]
  overrides: RecurrenceOverride[]
  settings: Settings
  date: string
  user: UserProfile | null
  focusSession: FocusSession | null
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error'
  isAddModalOpen: boolean
  isAuthModalOpen: boolean
  activeTab: 'today' | 'schedule' | 'tasks' | 'settings'

  // Actions
  setDate: (date: string) => void
  setActiveTab: (tab: 'today' | 'schedule' | 'tasks' | 'settings') => void
  setAddModalOpen: (open: boolean) => void
  setAuthModalOpen: (open: boolean) => void
  setUser: (user: UserProfile | null) => void

  // Schedule Items
  addItem: (item: Omit<ScheduleItem, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => ScheduleItem
  updateItem: (id: string, updates: Partial<ScheduleItem>) => void
  deleteItem: (id: string) => void

  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'boardOrder'>) => Task
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTaskDone: (id: string) => void

  // Overrides
  skipOccurrence: (itemId: string, date: string) => void

  // Focus
  startFocus: (targetId: string, targetType: 'item' | 'task', targetTitle: string, plannedMin: number) => void
  stopFocus: () => void

  // Cloud Sync
  syncWithCloud: () => Promise<void>
  pushItemToCloud: (item: ScheduleItem) => Promise<void>
  pushTaskToCloud: (task: Task) => Promise<void>
}

const DEFAULT_SETTINGS: Settings = {
  dayStart: 420, // 7:00 AM
  dayEnd: 1380, // 11:00 PM
  targetFreeMin: 120, // 2h free buffer
  endOfDayReviewAt: 1320, // 10:00 PM
  onboardingComplete: true,
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      items: [],
      tasks: [],
      overrides: [],
      settings: DEFAULT_SETTINGS,
      date: todayISO(),
      user: null,
      focusSession: null,
      syncStatus: 'idle',
      isAddModalOpen: false,
      isAuthModalOpen: false,
      activeTab: 'today',

      setDate: (date) => set({ date }),
      setActiveTab: (activeTab) => set({ activeTab }),
      setAddModalOpen: (isAddModalOpen) => set({ isAddModalOpen }),
      setAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen }),
      setUser: (user) => set({ user }),

      addItem: (itemData) => {
        const now = Date.now()
        const newItem: ScheduleItem = {
          ...itemData,
          id: uid('item'),
          createdAt: now,
          updatedAt: now,
          version: 1,
        }
        set((s) => ({ items: [...s.items, newItem] }))
        get().pushItemToCloud(newItem)
        return newItem
      },

      updateItem: (id, updates) => {
        set((s) => ({
          items: s.items.map((it) =>
            it.id === id ? { ...it, ...updates, updatedAt: Date.now(), version: it.version + 1 } : it
          ),
        }))
        const updated = get().items.find((it) => it.id === id)
        if (updated) get().pushItemToCloud(updated)
      },

      deleteItem: (id) => {
        set((s) => ({
          items: s.items.filter((it) => it.id !== id),
        }))
        const user = get().user
        if (user) {
          Promise.resolve(supabase.from('schedule_items').delete().eq('id', id)).catch(console.error)
        }
      },

      addTask: (taskData) => {
        const now = Date.now()
        const currentTasks = get().tasks
        const newTask: Task = {
          ...taskData,
          id: uid('task'),
          boardOrder: currentTasks.length,
          createdAt: now,
          updatedAt: now,
          version: 1,
        }
        set((s) => ({ tasks: [...s.tasks, newTask] }))
        get().pushTaskToCloud(newTask)
        return newTask
      },

      updateTask: (id, updates) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: Date.now(), version: t.version + 1 } : t
          ),
        }))
        const updated = get().tasks.find((t) => t.id === id)
        if (updated) get().pushTaskToCloud(updated)
      },

      deleteTask: (id) => {
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
        }))
        const user = get().user
        if (user) {
          Promise.resolve(supabase.from('tasks').delete().eq('id', id)).catch(console.error)
        }
      },

      toggleTaskDone: (id) => {
        const task = get().tasks.find((t) => t.id === id)
        if (!task) return
        const nextStatus = task.status === 'done' ? 'todo' : 'done'
        get().updateTask(id, { status: nextStatus })
      },

      skipOccurrence: (itemId, date) => {
        const newOverride: RecurrenceOverride = {
          id: uid('ovr'),
          itemId,
          date,
          action: 'skip',
        }
        set((s) => ({ overrides: [...s.overrides, newOverride] }))
      },

      startFocus: (targetId, targetType, targetTitle, plannedMin) => {
        set({
          focusSession: {
            targetId,
            targetType,
            targetTitle,
            startedAt: Date.now(),
            plannedMin,
          },
        })
      },

      stopFocus: () => {
        set({ focusSession: null })
      },

      pushItemToCloud: async (item: ScheduleItem) => {
        const user = get().user
        if (!user) return
        try {
          await supabase.from('schedule_items').upsert({
            id: item.id,
            user_id: user.id,
            type: item.type,
            title: item.title,
            start_time: item.startTime || null,
            duration: item.duration,
            preferred_start: item.preferredStart || null,
            preferred_end: item.preferredEnd || null,
            date: item.date || null,
            recurrence: item.recurrence || null,
            location: item.location || null,
            color: item.color,
            notes: item.notes || null,
            version: item.version,
            updated_at: new Date(item.updatedAt).toISOString(),
          })
        } catch (e) {
          console.warn('Failed to push item to cloud:', e)
        }
      },

      pushTaskToCloud: async (task: Task) => {
        const user = get().user
        if (!user) return
        try {
          await supabase.from('tasks').upsert({
            id: task.id,
            user_id: user.id,
            title: task.title,
            notes: task.notes || null,
            estimate: task.estimate || null,
            priority: task.priority,
            status: task.status,
            scheduled_date: task.scheduledDate || null,
            column_id: task.columnId,
            board_order: task.boardOrder,
            tags: task.tags || [],
            version: task.version,
            updated_at: new Date(task.updatedAt).toISOString(),
          })
        } catch (e) {
          console.warn('Failed to push task to cloud:', e)
        }
      },

      syncWithCloud: async () => {
        const user = get().user
        if (!user) return
        set({ syncStatus: 'syncing' })
        try {
          const [itemsRes, tasksRes] = await Promise.all([
            supabase.from('schedule_items').select('*').eq('user_id', user.id),
            supabase.from('tasks').select('*').eq('user_id', user.id),
          ])

          if (itemsRes.data) {
            const mappedItems: ScheduleItem[] = itemsRes.data.map((r: any) => ({
              id: r.id,
              type: r.type,
              title: r.title,
              startTime: r.start_time,
              duration: r.duration,
              preferredStart: r.preferred_start,
              preferredEnd: r.preferred_end,
              date: r.date,
              recurrence: r.recurrence,
              location: r.location,
              color: r.color || 'emerald',
              notes: r.notes,
              createdAt: new Date(r.created_at).getTime(),
              updatedAt: new Date(r.updated_at).getTime(),
              version: r.version || 1,
            }))
            if (mappedItems.length > 0) set({ items: mappedItems })
          }

          if (tasksRes.data) {
            const mappedTasks: Task[] = tasksRes.data.map((r: any) => ({
              id: r.id,
              title: r.title,
              notes: r.notes,
              estimate: r.estimate,
              priority: r.priority || 'medium',
              status: r.status || 'todo',
              scheduledDate: r.scheduled_date,
              columnId: r.column_id || 'todo',
              boardOrder: r.board_order || 0,
              tags: r.tags || [],
              createdAt: new Date(r.created_at).getTime(),
              updatedAt: new Date(r.updated_at).getTime(),
              version: r.version || 1,
            }))
            if (mappedTasks.length > 0) set({ tasks: mappedTasks })
          }

          set({ syncStatus: 'synced' })
        } catch (err) {
          console.warn('Cloud sync error:', err)
          set({ syncStatus: 'error' })
        }
      },
    }),
    {
      name: 'day-draft-mobile-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items,
        tasks: state.tasks,
        overrides: state.overrides,
        settings: state.settings,
        user: state.user,
      }),
    }
  )
)
