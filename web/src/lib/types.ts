// Domain model for the Second Brain scheduler.
//
// Pillar 1 — Fixed vs Fluid: a Block is either an `anchor` (hard start time,
// non-negotiable: classes, meetings) or a `routine` (fluid, tied to a phase of
// the day and slidable). Tasks nest *inside* a block or sit in the inbox.
// Pillar 2 — Energy routing: every Block and Task carries an `energy` tag.

export type Energy = 'alpha' | 'medium' | 'admin' // High Focus / Medium / Low-Admin
export type BlockKind = 'anchor' | 'routine'
export type DayPhase = 'morning' | 'afternoon' | 'night'
export type BlockStatus = 'planned' | 'active' | 'done' | 'skipped'
export type TaskStatus = 'todo' | 'done'
export type Priority = 'low' | 'med' | 'high'

export interface Category {
  id: string
  name: string
  /** tailwind color family, e.g. 'indigo' | 'emerald' */
  color: string
}

export interface Block {
  id: string
  title: string
  kind: BlockKind
  energy: Energy
  categoryId?: string
  /** 'YYYY-MM-DD' — the day this block belongs to */
  date: string
  /** anchors: minutes from midnight (required). routines: undefined, computed at layout time */
  startMin?: number
  durationMin: number
  /** routines belong to a phase of the day */
  phase?: DayPhase
  status: BlockStatus
  notes?: string
  createdAt: number
  /** ordering used when packing routine blocks into a phase */
  order: number
}

export interface Task {
  id: string
  title: string
  energy: Energy
  priority: Priority
  estimateMin?: number
  status: TaskStatus
  /** the block this task is nested inside; undefined = inbox / backlog */
  blockId?: string
  dueAt?: string
  createdAt: number
  /** true if dropped in via quick-capture */
  fromCapture?: boolean
}

// Pillar 3 — Template routine engine
export interface TemplateBlock {
  title: string
  kind: BlockKind
  energy: Energy
  phase?: DayPhase
  durationMin: number
  startMin?: number
  categoryId?: string
}
export interface DayTemplate {
  id: string
  name: string
  description?: string
  blocks: TemplateBlock[]
}

// Pillar 4 — "Now" focus session
export interface Session {
  blockId: string
  startedAt: number // epoch ms
  plannedMin: number
}

export interface Settings {
  dayStartMin: number
  morningEndMin: number
  afternoonEndMin: number
  dayEndMin: number
  /** target amount of unscheduled/free time to protect each day */
  targetFreeMin: number
}

export const ENERGY_LABEL: Record<Energy, string> = {
  alpha: 'High Focus',
  medium: 'Medium',
  admin: 'Admin',
}

export const PHASE_LABEL: Record<DayPhase, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  night: 'Night',
}
