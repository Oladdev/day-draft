// Small time helpers. We work in "minutes from midnight" for a given day,
// which keeps the layout math simple and avoids timezone surprises for v1.

export const toHHMM = (min: number): string => {
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export const to12h = (min: number): string => {
  let h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  const ap = h < 12 ? 'AM' : 'PM'
  h = h % 12
  if (h === 0) h = 12
  return `${h}:${String(m).padStart(2, '0')} ${ap}`
}

export const parseHHMM = (s: string): number => {
  const [h, m] = s.split(':').map((x) => parseInt(x, 10))
  return (h || 0) * 60 + (m || 0)
}

export const todayISO = (): string => isoOf(new Date())

export const isoOf = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`

export const nowMin = (): number => {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

export const fmtDur = (min: number): string => {
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  if (h <= 0) return `${m}m`
  return m ? `${h}h ${m}m` : `${h}h`
}

export const addDaysISO = (iso: string, days: number): string => {
  const [y, m, d] = iso.split('-').map((x) => parseInt(x, 10))
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + days)
  return isoOf(dt)
}

export const prettyDate = (iso: string): string => {
  const [y, m, d] = iso.split('-').map((x) => parseInt(x, 10))
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}
