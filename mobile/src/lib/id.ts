/**
 * Simple collision-resistant ID generator for items & tasks
 */
export function uid(prefix: string = 'id'): string {
  const ts = Date.now().toString(36)
  const rnd = Math.random().toString(36).substring(2, 8)
  return `${prefix}_${ts}_${rnd}`
}
