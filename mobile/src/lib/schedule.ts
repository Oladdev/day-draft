/**
 * Schedule Layout Engine for Mobile
 */

import type { ScheduleItem, RecurrenceOverride, Settings } from './types'
import { parseHHMM } from './time'
import { resolveItemsForDate, type ResolvedOccurrence } from './recurrence'

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
  capacityPct: number
  isOverloaded: boolean
}

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

  const fixed: ResolvedOccurrence[] = []
  const routines: ResolvedOccurrence[] = []

  for (const occ of occurrences) {
    if ((occ.item.type === 'routine' || occ.item.type === 'reading') && !occ.item.startTime) {
      routines.push(occ)
    } else {
      fixed.push(occ)
    }
  }

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

  routines.sort((a, b) => b.duration - a.duration)

  for (const occ of routines) {
    const pStart = occ.item.preferredStart ? parseHHMM(occ.item.preferredStart) : settings.dayStart
    const pEnd = occ.item.preferredEnd ? parseHHMM(occ.item.preferredEnd) : settings.dayEnd
    const dur = occ.duration

    const availableGaps = computeGaps(placed, pStart, pEnd)
    const fittingGap = availableGaps.find((g) => g.durationMin >= dur)

    if (fittingGap) {
      placed.push({
        id: `${occ.item.id}-${date}`,
        item: occ.item,
        title: occ.item.title,
        type: occ.item.type,
        startMin: fittingGap.startMin,
        durationMin: dur,
        endMin: fittingGap.startMin + dur,
        color: occ.item.color,
        location: occ.item.location,
        notes: occ.item.notes,
        isRoutinePlaced: true,
      })
      placed.sort((a, b) => a.startMin - b.startMin)
    } else {
      overflow.push(occ.item)
    }
  }

  placed.sort((a, b) => a.startMin - b.startMin)

  const freeGaps = computeGaps(placed, settings.dayStart, settings.dayEnd)
  const committedMin = placed.reduce((acc, it) => acc + it.durationMin, 0)
  const totalDayMin = Math.max(1, settings.dayEnd - settings.dayStart)
  const freeMin = Math.max(0, totalDayMin - committedMin)
  const capacityPct = Math.round((committedMin / (totalDayMin - settings.targetFreeMin)) * 100)

  return {
    date,
    placed,
    freeGaps,
    conflicts,
    overflow,
    committedMin,
    freeMin,
    capacityPct,
    isOverloaded: capacityPct > 100,
  }
}
