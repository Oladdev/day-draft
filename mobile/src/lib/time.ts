/**
 * Time utilities for mobile
 */

export const toHHMM = (min: number): string => {
  const h = Math.floor(min / 60) % 24
  const m = Math.round(min % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export const to12h = (min: number): string => {
  const h24 = Math.floor(min / 60) % 24
  const m = Math.round(min % 60)
  const suffix = h24 >= 12 ? 'PM' : 'AM'
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${String(m).padStart(2, '0')} ${suffix}`
}

export const fmtDur = (min: number): string => {
  if (min <= 0) return '0m'
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

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

export const parseHHMM = (s: string): number => {
  const [h, m] = s.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return 0
  return h * 60 + m
}

export const todayISO = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const dateToISO = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const addDaysISO = (iso: string, days: number): string => {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return dateToISO(d)
}

export const nowMin = (): number => {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

export const dayOfWeek = (iso: string): number =>
  new Date(iso + 'T12:00:00').getDay()

export const prettyDate = (iso: string): string => {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export const longDate = (iso: string): string => {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export const weekStart = (iso: string): string => {
  const d = new Date(iso + 'T12:00:00')
  const dow = d.getDay()
  const diff = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + diff)
  return dateToISO(d)
}

export const weekDates = (iso: string): string[] => {
  const mon = weekStart(iso)
  return Array.from({ length: 7 }, (_, i) => addDaysISO(mon, i))
}

export const greeting = (): string => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
