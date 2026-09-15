/**
 * Schedule Layout Engine
 *
 * Takes items occurring on a given date, arranges fixed items (class, meeting, event),
 * auto-places flexible routines into preferred time gaps, detects conflicts,
 * and calculates time metrics (committed time, free time, capacity percentage).
 */

import type { ScheduleItem, RecurrenceOverride, Settings } from './types.ts'
import { parseHHMM } from './time.ts'
import { resolveItemsForDate, type ResolvedOccurrence } from './recurrence.ts'

export interface PlacedItem {
  id: string
  item: ScheduleItem
  title: string
  type: ScheduleItem['type']
  startMin: number
  durationMin: number
  endMin: number
  color: string
  location?: string
  notes?: string
  isRescheduled?: boolean
  isRoutinePlaced?: boolean
}

export interface FreeGap {
  startMin: number
  endMin: number
  durationMin: number
}

export interface Conflict {
  itemA: PlacedItem
  itemB: PlacedItem
  startMin: number
  endMin: number
}

export interface DayLayout {
  date: string
  placed: PlacedItem[]
  freeGaps: FreeGap[]
  conflicts: Conflict[]
  overflow: ScheduleItem[]
  committedMin: number
  freeMin: number
  capacityPct: number // 0 - 100+
  isOverloaded: boolean
}

/** Helper: find intervals of free time within a window, avoiding placed blocks. */
function computeGaps(placed: PlacedItem[], windowStart: number, windowEnd: number): FreeGap[] {
  const sorted = [...placed].sort((a, b) => a.startMin - b.startMin)
  const gaps: FreeGap[] = []
  let cursor = windowStart

  for (const item of sorted) {
    if (item.endMin <= cursor) continue
    if (item.startMin > cursor) {
      gaps.push({
        startMin: cursor,
        endMin: Math.min(item.startMin, windowEnd),
        durationMin: Math.min(item.startMin, windowEnd) - cursor,
      })
    }
    cursor = Math.max(cursor, item.endMin)
    if (cursor >= windowEnd) break
  }

  if (cursor < windowEnd) {
    gaps.push({
      startMin: cursor,
      endMin: windowEnd,
      durationMin: windowEnd - cursor,
    })
  }

  return gaps.filter((g) => g.durationMin >= 10)
}

/**
 * Layout a single day.
 */
export function layoutDay(
  items: ScheduleItem[],
  date: string,
  settings: Settings,
  overrides: RecurrenceOverride[] = []
): DayLayout {
  const occurrences = resolveItemsForDate(items, date, overrides)

  const placed: PlacedItem[] = []
  const overflow: ScheduleItem[] = []
  const conflicts: Conflict[] = []

  // Separate fixed vs routine
  const fixed: ResolvedOccurrence[] = []
  const routines: ResolvedOccurrence[] = []

  for (const occ of occurrences) {
    if ((occ.item.type === 'routine' || occ.item.type === 'reading') && !occ.item.startTime) {
      routines.push(occ)
    } else {
      fixed.push(occ)
    }
  }

  // 1. Place fixed commitments (class, meeting, event, or routines with a fixed time)
  for (const occ of fixed) {
    const startMin = parseHHMM(occ.startTime)
    const durationMin = occ.duration
    const endMin = startMin + durationMin

    placed.push({
      id: `${occ.item.id}-${date}`,
      item: occ.item,
      title: occ.item.title,
      type: occ.item.type,
      startMin,
      durationMin,
      endMin,
      color: occ.item.color,
      location: occ.item.location,
      notes: occ.item.notes,
      isRescheduled: occ.isRescheduled,
    })
  }

  // Detect conflicts among fixed items
  for (let i = 0; i < placed.length; i++) {
    for (let j = i + 1; j < placed.length; j++) {
      const a = placed[i]
      const b = placed[j]
      const overlapStart = Math.max(a.startMin, b.startMin)
      const overlapEnd = Math.min(a.endMin, b.endMin)
      if (overlapStart < overlapEnd) {
        conflicts.push({
          itemA: a,
          itemB: b,
          startMin: overlapStart,
          endMin: overlapEnd,
        })
      }
    }
  }

  // 2. Auto-place flexible routines into gaps
  // Sort routines by duration descending to pack larger slots first
  routines.sort((a, b) => b.duration - a.duration)

  for (const occ of routines) {
    const pStart = occ.item.preferredStart ? parseHHMM(occ.item.preferredStart) : settings.dayStart
    const pEnd = occ.item.preferredEnd ? parseHHMM(occ.item.preferredEnd) : settings.dayEnd
    const dur = occ.duration

    // Find gaps in preferred window
    const availableGaps = computeGaps(placed, pStart, pEnd)
    const fittingGap = availableGaps.find((g) => g.durationMin >= dur)

    if (fittingGap) {
      const startMin = fittingGap.startMin
      const endMin = startMin + dur
      placed.push({
        id: `${occ.item.id}-${date}`,
        item: occ.item,
        title: occ.item.title,
        type: occ.item.type,
        startMin,
        durationMin: dur,
        endMin,
        color: occ.item.color,
        location: occ.item.location,
        notes: occ.item.notes,
        isRoutinePlaced: true,
      })
    } else {
      // Could not fit in preferred window, push to overflow
      overflow.push(occ.item)
    }
  }

  // Sort all placed items by start time
  placed.sort((a, b) => a.startMin - b.startMin)

  // Compute final free gaps across the user's working day
  const freeGaps = computeGaps(placed, settings.dayStart, settings.dayEnd)

  // Metrics
  const committedMin = placed.reduce((sum, p) => sum + p.durationMin, 0)
  const totalDayCapacityMin = Math.max(60, settings.dayEnd - settings.dayStart)
  const maxProductiveCapacityMin = Math.max(30, totalDayCapacityMin - settings.targetFreeMin)
  const freeMin = Math.max(0, totalDayCapacityMin - committedMin)
  const capacityPct = Math.min(200, Math.round((committedMin / maxProductiveCapacityMin) * 100))
  const isOverloaded = capacityPct > 100

  return {
    date,
    placed,
    freeGaps,
    conflicts,
    overflow,
    committedMin,
    freeMin,
    capacityPct,
    isOverloaded,
  }
}
