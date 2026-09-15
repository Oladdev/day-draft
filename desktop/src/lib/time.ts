/**
 * Time utilities.
 *
 * All "minutes" values are minutes from midnight (0–1440).
 * Dates are ISO 'YYYY-MM-DD' strings.
 * Times are 'HH:MM' (24-hour) strings.
 */

// ── Formatting ──

/** Minutes from midnight → 'HH:MM' (24h). */
export const toHHMM = (min: number): string => {
  const h = Math.floor(min / 60) % 24
  const m = Math.round(min % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Minutes from midnight → '9:00 AM' style. */
export const to12h = (min: number): string => {
  const h24 = Math.floor(min / 60) % 24
  const m = Math.round(min % 60)
  const suffix = h24 >= 12 ? 'PM' : 'AM'
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${String(m).padStart(2, '0')} ${suffix}`
}

/** Duration in minutes → human-readable ('1h 30m', '45m', '2h'). */
export const fmtDur = (min: number): string => {
  if (min <= 0) return '0m'
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/** Seconds → 'MM:SS' or 'H:MM:SS'. */
export const fmtTimer = (totalSec: number): string => {
  const abs = Math.abs(Math.round(totalSec))
  const h = Math.floor(abs / 3600)
  const m = Math.floor((abs % 3600) / 60)
  const s = abs % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  const sign = totalSec < 0 ? '-' : ''
  return h > 0 ? `${sign}${h}:${mm}:${ss}` : `${sign}${mm}:${ss}`
}

// ── Parsing ──

/** 'HH:MM' → minutes from midnight. Returns 0 for invalid input. */
export const parseHHMM = (s: string): number => {
  const [h, m] = s.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return 0
  return h * 60 + m
}

// ── Dates ──

/** Today's date as 'YYYY-MM-DD'. */
export const todayISO = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Any Date → 'YYYY-MM-DD'. */
export const dateToISO = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** 'YYYY-MM-DD' + offset days → 'YYYY-MM-DD'. */
export const addDaysISO = (iso: string, days: number): string => {
  const d = new Date(iso + 'T12:00:00') // noon avoids DST edge
  d.setDate(d.getDate() + days)
  return dateToISO(d)
}

/** Current time as minutes from midnight. */
export const nowMin = (): number => {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

/** 'YYYY-MM-DD' → day-of-week index (0 = Sunday). */
export const dayOfWeek = (iso: string): number =>
  new Date(iso + 'T12:00:00').getDay()

/** 'YYYY-MM-DD' → human-readable: 'Mon, Sep 14'. */
export const prettyDate = (iso: string): string => {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

/** 'YYYY-MM-DD' → long format: 'Monday, September 14, 2026'. */
export const longDate = (iso: string): string => {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

/** Get the Monday of the week containing the given date. */
export const weekStart = (iso: string): string => {
  const d = new Date(iso + 'T12:00:00')
  const dow = d.getDay()
  const diff = dow === 0 ? -6 : 1 - dow // Monday = start
  d.setDate(d.getDate() + diff)
  return dateToISO(d)
}

/** Generate an array of 7 ISO date strings for the week containing `iso`. */
export const weekDates = (iso: string): string[] => {
  const mon = weekStart(iso)
  return Array.from({ length: 7 }, (_, i) => addDaysISO(mon, i))
}

/**
 * Returns formatted week-of-month info (e.g. "September 2026 · Week 3").
 * Day 1-7: Week 1, 8-14: Week 2, 15-21: Week 3, 22-28: Week 4, 29+: Week 5
 */
export const weekOfMonthInfo = (
  isoDate: string
): { monthName: string; weekNumber: number; fullLabel: string } => {
  const d = new Date(isoDate + 'T12:00:00')
  const monthName = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const day = d.getDate()
  const weekNumber = Math.ceil(day / 7)
  return {
    monthName,
    weekNumber,
    fullLabel: `${monthName} · Week ${weekNumber}`,
  }
}

/** Time-of-day greeting. */
export const greeting = (): string => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
