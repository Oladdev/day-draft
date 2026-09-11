import type { Block, DayPhase, Settings } from './types'

export interface Interval {
  start: number
  end: number
}

export interface Placed {
  block: Block
  startMin: number
  endMin: number
}

export const PHASES: DayPhase[] = ['morning', 'afternoon', 'night']

export function phaseWindow(phase: DayPhase, s: Settings): Interval {
  if (phase === 'morning') return { start: s.dayStartMin, end: s.morningEndMin }
  if (phase === 'afternoon') return { start: s.morningEndMin, end: s.afternoonEndMin }
  return { start: s.afternoonEndMin, end: s.dayEndMin }
}

export function phaseOf(min: number, s: Settings): DayPhase {
  if (min < s.morningEndMin) return 'morning'
  if (min < s.afternoonEndMin) return 'afternoon'
  return 'night'
}

/** Free gaps left inside `win` after removing the occupied intervals. */
function freeGaps(win: Interval, occupied: Interval[]): Interval[] {
  const clipped = occupied
    .filter((o) => o.end > win.start && o.start < win.end)
    .map((o) => ({ start: Math.max(o.start, win.start), end: Math.min(o.end, win.end) }))
    .sort((a, b) => a.start - b.start)

  const gaps: Interval[] = []
  let cursor = win.start
  for (const o of clipped) {
    if (o.start > cursor) gaps.push({ start: cursor, end: o.start })
    cursor = Math.max(cursor, o.end)
  }
  if (cursor < win.end) gaps.push({ start: cursor, end: win.end })
  return gaps
}

export interface DayLayout {
  placed: Placed[]
  /** routine blocks that could not be fit into their phase's open gaps */
  overflow: Block[]
  /** total free minutes left within the active day window */
  freeMin: number
  /** total committed minutes (anchors + placed routines) */
  committedMin: number
  /** pairs of anchors that overlap in time */
  conflicts: Array<[Block, Block]>
  gaps: Interval[]
}

/**
 * Lay out a single day.
 * - Anchors keep their hard start times.
 * - Routine blocks are packed (in `order`) into the free gaps of their phase.
 * - Whatever cannot fit is returned as `overflow` so the UI can offer to rebalance.
 */
export function layoutDay(dayBlocks: Block[], s: Settings): DayLayout {
  const anchors = dayBlocks
    .filter((b) => b.kind === 'anchor' && b.startMin != null)
    .sort((a, b) => (a.startMin! - b.startMin!))

  const placed: Placed[] = anchors.map((b) => ({
    block: b,
    startMin: b.startMin!,
    endMin: b.startMin! + b.durationMin,
  }))

  // Detect anchor-vs-anchor overlaps.
  const conflicts: Array<[Block, Block]> = []
  for (let i = 0; i < placed.length; i++) {
    for (let j = i + 1; j < placed.length; j++) {
      if (placed[i].startMin < placed[j].endMin && placed[j].startMin < placed[i].endMin) {
        conflicts.push([placed[i].block, placed[j].block])
      }
    }
  }

  const overflow: Block[] = []
  let openGaps: Interval[] = []

  for (const phase of PHASES) {
    const win = phaseWindow(phase, s)
    const occupied = placed
      .filter((p) => p.endMin > win.start && p.startMin < win.end)
      .map((p) => ({ start: p.startMin, end: p.endMin }))
    const gaps = freeGaps(win, occupied)

    const routines = dayBlocks
      .filter((b) => b.kind === 'routine' && b.phase === phase && b.status !== 'skipped')
      .sort((a, b) => a.order - b.order)

    for (const r of routines) {
      let didPlace = false
      for (let gi = 0; gi < gaps.length; gi++) {
        const g = gaps[gi]
        if (g.end - g.start >= r.durationMin) {
          placed.push({ block: r, startMin: g.start, endMin: g.start + r.durationMin })
          gaps[gi] = { start: g.start + r.durationMin, end: g.end }
          didPlace = true
          break
        }
      }
      if (!didPlace) overflow.push(r)
    }

    openGaps = openGaps.concat(gaps.filter((g) => g.end - g.start > 0))
  }

  placed.sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin)

  const dayStart = s.dayStartMin
  const dayEnd = s.dayEndMin
  const committedMin = placed.reduce(
    (sum, p) => sum + Math.max(0, Math.min(p.endMin, dayEnd) - Math.max(p.startMin, dayStart)),
    0,
  )
  const freeMin = openGaps.reduce((sum, g) => sum + (g.end - g.start), 0)

  return { placed, overflow, freeMin, committedMin, conflicts, gaps: openGaps }
}

export interface NowNext {
  current?: Placed
  next?: Placed
}

/** Given a laid-out day, find what's happening now and what's next. */
export function nowNext(placed: Placed[], curMin: number): NowNext {
  const current = placed.find((p) => p.startMin <= curMin && curMin < p.endMin)
  const next = placed
    .filter((p) => p.startMin > curMin)
    .sort((a, b) => a.startMin - b.startMin)[0]
  return { current, next }
}
