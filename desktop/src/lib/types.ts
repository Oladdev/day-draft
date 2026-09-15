/**
 * Day Draft — Domain Model
 *
 * Your schedule speaks your language. No "blocks", no "anchors".
 * A Class is a Class. A Meeting is a Meeting.
 */

// ────────────────────────────────────────────────────────────
// Schedule Items — things that take time in your day
// ────────────────────────────────────────────────────────────

/** The kind of schedule item, each with its own form and icon. */
export type ItemType = 'class' | 'meeting' | 'event' | 'routine' | 'reading'

/** Recurrence rule: how an item repeats. */
export interface Recurrence {
  /** 'daily' = every day, 'weekly' = on specific days of the week. */
  type: 'daily' | 'weekly'
  /** For 'weekly': which days. 0 = Sunday, 1 = Monday, ..., 6 = Saturday. */
  days?: number[]
  /** Optional end date (YYYY-MM-DD). Omit for "repeats forever". */
  endDate?: string
}

/**
 * A schedule item — a class, meeting, event, or routine.
 *
 * - Classes, meetings, events have a fixed `startTime`.
 * - Routines have a preferred time window (`preferredStart`–`preferredEnd`)
 *   and the layout engine auto-places them in the best gap.
 */
export interface ScheduleItem {
  id: string
  type: ItemType
  title: string

  // ── Time ──
  /** Fixed start time, 'HH:MM' (24h). Required for class/meeting/event. */
  startTime?: string
  /** Duration in minutes. */
  duration: number
  /** For routines: earliest acceptable start, 'HH:MM'. */
  preferredStart?: string
  /** For routines: latest acceptable end, 'HH:MM'. */
  preferredEnd?: string

  // ── When ──
  /** For one-off items (no recurrence): the specific date, 'YYYY-MM-DD'. */
  date?: string
  /** Recurrence rule. If present, item repeats on matching days. */
  recurrence?: Recurrence

  // ── Metadata ──
  categoryId?: string
  location?: string
  /** Tailwind color family: 'emerald', 'sky', 'rose', etc. */
  color: string
  notes?: string

  // ── Sync ──
  createdAt: number
  updatedAt: number
  /** Monotonically increasing version for conflict resolution. */
  version: number
  /** Soft-delete tombstone. `true` = treat as deleted but keep for sync. */
  deleted?: boolean
}

/**
 * A per-date override for a recurring item.
 * "Skip this Tuesday" or "Reschedule Friday's lecture to 2 PM."
 */
export interface RecurrenceOverride {
  id: string
  /** The recurring ScheduleItem this overrides. */
  itemId: string
  /** Which occurrence date to override, 'YYYY-MM-DD'. */
  date: string
  /** 'skip' = don't show on this date. 'reschedule' = change time/duration. */
  action: 'skip' | 'reschedule'
  /** New start time if rescheduling, 'HH:MM'. */
  newStartTime?: string
  /** New duration if rescheduling (minutes). */
  newDuration?: number
}

// ────────────────────────────────────────────────────────────
// Tasks — things to do (no fixed time unless scheduled)
// ────────────────────────────────────────────────────────────

export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = 'todo' | 'in-progress' | 'done'

export interface Task {
  id: string
  title: string
  notes?: string
  /** Estimated duration in minutes. */
  estimate?: number
  priority: TaskPriority
  status: TaskStatus
  /** Day this task is planned for, 'YYYY-MM-DD'. */
  scheduledDate?: string
  /** If nested under a schedule item (e.g., subtasks for a coding routine). */
  parentItemId?: string
  categoryId?: string
  tags?: string[]

  // ── Board (kanban) position ──
  columnId: string
  boardOrder: number

  // ── Capture metadata ──
  fromCapture?: boolean

  // ── Sync ──
  createdAt: number
  updatedAt: number
  version: number
  deleted?: boolean
}

// ────────────────────────────────────────────────────────────
// Organization
// ────────────────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  /** Tailwind color family, e.g. 'emerald', 'sky'. */
  color: string
  icon?: string
}

export interface BoardColumn {
  id: string
  title: string
  order: number
}

// ────────────────────────────────────────────────────────────
// Focus Session
// ────────────────────────────────────────────────────────────

export interface FocusSession {
  /** ID of the ScheduleItem or Task being focused on. */
  targetId: string
  targetType: 'item' | 'task'
  targetTitle: string
  startedAt: number
  plannedMin: number
}

// ────────────────────────────────────────────────────────────
// Settings
// ────────────────────────────────────────────────────────────

export interface Settings {
  /** Day starts at this many minutes from midnight (e.g., 360 = 6:00 AM). */
  dayStart: number
  /** Day ends at this many minutes from midnight (e.g., 1380 = 11:00 PM). */
  dayEnd: number
  /** How many minutes of free time to protect per day. */
  targetFreeMin: number
  /** When to trigger end-of-day review (minutes from midnight, e.g., 1320 = 10 PM). */
  endOfDayReviewAt: number
  /** Whether the first-run onboarding wizard has been completed. */
  onboardingComplete: boolean
}

// ────────────────────────────────────────────────────────────
// Views & Navigation
// ────────────────────────────────────────────────────────────

export type View = 'today' | 'week' | 'board' | 'onboarding' | 'auth'

// ────────────────────────────────────────────────────────────
// UI constants — display labels, icons, day names
// ────────────────────────────────────────────────────────────

export const ITEM_TYPE_LABEL: Record<ItemType, string> = {
  class: 'Class',
  meeting: 'Meeting',
  event: 'Event',
  routine: 'Routine',
  reading: 'Reading',
}

export const ITEM_TYPE_EMOJI: Record<ItemType, string> = {
  class: '📚',
  meeting: '👥',
  event: '📌',
  routine: '🔄',
  reading: '📖',
}

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday',
] as const

export const DAY_SHORT = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
] as const
