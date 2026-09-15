/**
 * Recurrence Engine for Mobile
 */

import type { ScheduleItem, RecurrenceOverride } from './types'
import { dayOfWeek } from './time'

export interface ResolvedOccurrence {
  item: ScheduleItem
  date: string
  startTime: string
  duration: number
  isRescheduled: boolean
}

export function resolveItemForDate(
  item: ScheduleItem,
  targetDate: string,
  overrides: RecurrenceOverride[] = []
): ResolvedOccurrence | null {
  if (item.deleted) return null

  const override = overrides.find((o) => o.itemId === item.id && o.date === targetDate)
  if (override?.action === 'skip') {
    return null
  }

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

  const { recurrence } = item

  if (recurrence.endDate && targetDate > recurrence.endDate) {
    return null
  }

  if (item.date && targetDate < item.date) {
    return null
  }

  let matches = false

  if (recurrence.type === 'daily') {
    matches = true
  } else if (recurrence.type === 'weekly') {
    const dow = dayOfWeek(targetDate)
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
