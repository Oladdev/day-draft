/**
 * Day Draft — Universal Shared Domain Model
 */

export type ItemType = 'class' | 'meeting' | 'event' | 'routine' | 'reading'

export interface Recurrence {
  type: 'daily' | 'weekly'
  days?: number[]
  endDate?: string
}

export interface ScheduleItem {
  id: string
  type: ItemType
  title: string
  startTime?: string
  duration: number
  preferredStart?: string
  preferredEnd?: string
  date?: string
  recurrence?: Recurrence
  categoryId?: string
  location?: string
  color: string
  notes?: string
  createdAt: number
  updatedAt: number
  version: number
  deleted?: boolean
}

export interface RecurrenceOverride {
  id: string
  itemId: string
  date: string
  action: 'skip' | 'reschedule'
  newStartTime?: string
  newDuration?: number
}

export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = 'todo' | 'in-progress' | 'done'

export interface Task {
  id: string
  title: string
  notes?: string
  estimate?: number
  priority: TaskPriority
  status: TaskStatus
  scheduledDate?: string
  parentItemId?: string
  categoryId?: string
  tags?: string[]
  columnId: string
  boardOrder: number
  fromCapture?: boolean
  createdAt: number
  updatedAt: number
  version: number
  deleted?: boolean
}

export interface Category {
  id: string
  name: string
  color: string
  icon?: string
}

export interface BoardColumn {
  id: string
  title: string
  order: number
}

export interface FocusSession {
  targetId: string
  targetType: 'item' | 'task'
  targetTitle: string
  startedAt: number
  plannedMin: number
}

export interface Settings {
  dayStart: number
  dayEnd: number
  targetFreeMin: number
  endOfDayReviewAt: number
  onboardingComplete: boolean
}

export interface UserProfile {
  id: string
  email: string
  name: string
  avatarUrl?: string
  biometricEnabled?: boolean
}

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
