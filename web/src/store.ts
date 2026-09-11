import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  Block,
  Category,
  DayTemplate,
  Energy,
  Session,
  Settings,
  Task,
} from './lib/types'
import { uid } from './lib/id'
import { CATEGORIES, DEFAULT_SETTINGS, TEMPLATES, seedToday } from './lib/seed'
import { todayISO } from './lib/time'
import { phaseOf } from './lib/schedule'

/** One-click "downshift" cycle for energy routing (pillar 2). */
const ENERGY_CYCLE: Record<Energy, Energy> = {
  alpha: 'medium',
  medium: 'admin',
  admin: 'alpha',
}

const seeded = seedToday()

export interface AppState {
  categories: Category[]
  blocks: Block[]
  tasks: Task[]
  templates: DayTemplate[]
  settings: Settings
  session: Session | null
  captureOpen: boolean
  /** the day currently being viewed, 'YYYY-MM-DD' */
  date: string

  // ---- blocks ----
  addBlock: (b: Partial<Block> & { title: string; kind: Block['kind'] }) => string
  updateBlock: (id: string, patch: Partial<Block>) => void
  removeBlock: (id: string) => void
  setBlockStatus: (id: string, status: Block['status']) => void
  cycleBlockEnergy: (id: string) => void

  // ---- tasks ----
  addTask: (t: Partial<Task> & { title: string }) => string
  updateTask: (id: string, patch: Partial<Task>) => void
  removeTask: (id: string) => void
  toggleTask: (id: string) => void
  assignTask: (taskId: string, blockId?: string) => void
  cycleTaskEnergy: (id: string) => void

  // ---- pillars ----
  applyTemplate: (templateId: string) => void
  startSession: (blockId: string) => void
  stopSession: () => void
  quickCapture: (title: string) => void
  setCapture: (open: boolean) => void
  createAdminSweep: () => void

  // ---- day nav ----
  setDate: (d: string) => void
  clearDay: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      categories: CATEGORIES,
      blocks: seeded.blocks,
      tasks: seeded.tasks,
      templates: TEMPLATES,
      settings: DEFAULT_SETTINGS,
      session: null,
      captureOpen: false,
      date: todayISO(),

      addBlock: (b) => {
        const id = uid()
        const { blocks, date } = get()
        const order =
          b.order ??
          Math.max(0, ...blocks.filter((x) => x.date === (b.date ?? date)).map((x) => x.order)) + 1
        const block: Block = {
          id,
          title: b.title,
          kind: b.kind,
          energy: b.energy ?? 'medium',
          categoryId: b.categoryId,
          date: b.date ?? date,
          startMin: b.startMin,
          durationMin: b.durationMin ?? 60,
          phase: b.phase,
          status: b.status ?? 'planned',
          notes: b.notes,
          createdAt: Date.now(),
          order,
        }
        set({ blocks: [...blocks, block] })
        return id
      },

      updateBlock: (id, patch) =>
        set((s) => ({ blocks: s.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),

      removeBlock: (id) =>
        set((s) => ({
          blocks: s.blocks.filter((b) => b.id !== id),
          // orphan any tasks nested in this block back to the inbox
          tasks: s.tasks.map((t) => (t.blockId === id ? { ...t, blockId: undefined } : t)),
          session: s.session?.blockId === id ? null : s.session,
        })),

      setBlockStatus: (id, status) =>
        set((s) => ({ blocks: s.blocks.map((b) => (b.id === id ? { ...b, status } : b)) })),

      cycleBlockEnergy: (id) =>
        set((s) => ({
          blocks: s.blocks.map((b) =>
            b.id === id ? { ...b, energy: ENERGY_CYCLE[b.energy] } : b,
          ),
        })),

      addTask: (t) => {
        const id = uid()
        const task: Task = {
          id,
          title: t.title,
          energy: t.energy ?? 'medium',
          priority: t.priority ?? 'med',
          estimateMin: t.estimateMin,
          status: t.status ?? 'todo',
          blockId: t.blockId,
          dueAt: t.dueAt,
          createdAt: Date.now(),
          fromCapture: t.fromCapture,
        }
        set((s) => ({ tasks: [...s.tasks, task] }))
        return id
      },

      updateTask: (id, patch) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),

      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t,
          ),
        })),

      assignTask: (taskId, blockId) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, blockId } : t)),
        })),

      cycleTaskEnergy: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, energy: ENERGY_CYCLE[t.energy] } : t,
          ),
        })),

      applyTemplate: (templateId) => {
        const { templates, date, blocks } = get()
        const tpl = templates.find((t) => t.id === templateId)
        if (!tpl) return
        let order = Math.max(0, ...blocks.filter((b) => b.date === date).map((b) => b.order))
        const now = Date.now()
        const created: Block[] = tpl.blocks.map((tb) => ({
          id: uid(),
          title: tb.title,
          kind: tb.kind,
          energy: tb.energy,
          categoryId: tb.categoryId,
          date,
          startMin: tb.startMin,
          durationMin: tb.durationMin,
          phase: tb.phase,
          status: 'planned',
          createdAt: now,
          order: ++order,
        }))
        set({ blocks: [...blocks, ...created] })
      },

      startSession: (blockId) => {
        const block = get().blocks.find((b) => b.id === blockId)
        if (!block) return
        set((s) => ({
          session: { blockId, startedAt: Date.now(), plannedMin: block.durationMin },
          blocks: s.blocks.map((b) => (b.id === blockId ? { ...b, status: 'active' } : b)),
        }))
      },

      stopSession: () =>
        set((s) => ({
          session: null,
          blocks: s.blocks.map((b) =>
            b.id === s.session?.blockId && b.status === 'active' ? { ...b, status: 'planned' } : b,
          ),
        })),

      quickCapture: (title) => {
        const trimmed = title.trim()
        if (!trimmed) return
        get().addTask({ title: trimmed, energy: 'admin', priority: 'med', fromCapture: true })
      },

      setCapture: (open) => set({ captureOpen: open }),

      createAdminSweep: () => {
        const { tasks, date, settings, blocks } = get()
        const sweepables = tasks.filter(
          (t) => t.status === 'todo' && !t.blockId && t.energy === 'admin',
        )
        const phase = phaseOf(
          Math.min(settings.afternoonEndMin - 30, Math.max(settings.morningEndMin, 15 * 60)),
          settings,
        )
        const order = Math.max(0, ...blocks.filter((b) => b.date === date).map((b) => b.order)) + 1
        const sweepId = uid()
        const sweep: Block = {
          id: sweepId,
          title: 'Admin Sweep',
          kind: 'routine',
          energy: 'admin',
          categoryId: 'cat-admin',
          date,
          durationMin: Math.max(30, Math.min(60, sweepables.reduce((n, t) => n + (t.estimateMin ?? 10), 0))),
          phase,
          status: 'planned',
          createdAt: Date.now(),
          order,
        }
        set((s) => ({
          blocks: [...s.blocks, sweep],
          tasks: s.tasks.map((t) =>
            sweepables.some((sw) => sw.id === t.id) ? { ...t, blockId: sweepId } : t,
          ),
        }))
      },

      setDate: (d) => set({ date: d }),

      clearDay: () =>
        set((s) => {
          const removedIds = new Set(s.blocks.filter((b) => b.date === s.date).map((b) => b.id))
          return {
            blocks: s.blocks.filter((b) => b.date !== s.date),
            tasks: s.tasks.map((t) =>
              t.blockId && removedIds.has(t.blockId) ? { ...t, blockId: undefined } : t,
            ),
            session: s.session && removedIds.has(s.session.blockId) ? null : s.session,
          }
        }),
    }),
    {
      name: 'day-draft-v1',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
)
