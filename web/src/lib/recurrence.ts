/**
 * Recurrence Engine
 *
 * Evaluates whether a ScheduleItem occurs on a given date (ISO 'YYYY-MM-DD'),
 * taking into account daily/weekly recurrence rules, date boundaries,
 * and specific overrides (skips or rescheduled times).
 */

import type { ScheduleItem, RecurrenceOverride } from './types.ts'
import { dayOfWeek } from './time.ts'

export interface ResolvedOccurrence {
  item: ScheduleItem
  date: string
  startTime: string
  duration: number
  isRescheduled: boolean
}

/**
 * Checks whether an item should appear on `targetDate`.
 * If it does, returns the resolved time & duration (accounting for overrides).
 * If skipped or not scheduled for this date, returns null.
 */
export function resolveItemForDate(
  item: ScheduleItem,
  targetDate: string,
  overrides: RecurrenceOverride[] = []
): ResolvedOccurrence | null {
  if (item.deleted) return null

  // Check overrides first
  const override = overrides.find((o) => o.itemId === item.id && o.date === targetDate)
  if (override?.action === 'skip') {
    return null
  }

  // 1. One-off item (no recurrence rule)
  if (!item.recurrence) {
    if (item.date !== targetDate) return null
    return {
      item,
      date: targetDate,
      startTime: override?.newStartTime ?? item.startTime ?? '09:00',
      duration: override?.newDuration ?? item.duration,
      isRescheduled: !!override && override.action === 'reschedule',
    }
  }

  // 2. Recurring item
  const { recurrence } = item

  // Check end date boundary
  if (recurrence.endDate && targetDate > recurrence.endDate) {
    return null
  }

  // Check start date boundary if specified
  if (item.date && targetDate < item.date) {
    return null
  }

  let matches = false

  if (recurrence.type === 'daily') {
    matches = true
  } else if (recurrence.type === 'weekly') {
    const dow = dayOfWeek(targetDate) // 0=Sun..6=Sat
    matches = (recurrence.days ?? []).includes(dow)
  }

  if (!matches) return null

  return {
    item,
    date: targetDate,
    startTime: override?.newStartTime ?? item.startTime ?? '09:00',
    duration: override?.newDuration ?? item.duration,
    isRescheduled: !!override && override.action === 'reschedule',
  }
}

/**
 * Resolves all active items that occur on `targetDate`.
 */
export function resolveItemsForDate(
  items: ScheduleItem[],
  targetDate: string,
  overrides: RecurrenceOverride[] = []
): ResolvedOccurrence[] {
  const list: ResolvedOccurrence[] = []
  for (const item of items) {
    const res = resolveItemForDate(item, targetDate, overrides)
    if (res) list.push(res)
  }
  return list
}
