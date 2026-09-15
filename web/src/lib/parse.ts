/**
 * Short Syntax Parser for Quick Capture (Super-Productivity style)
 *
 * Example inputs:
 *  - "Read Chapter 4 45m #reading"
 *  - "Fix database connection leak 2h #dev !high"
 *  - "Call client 15m !med"
 *  - "Prepare slides for seminar 1h30m"
 */

import type { TaskPriority } from './types'

export interface ParsedTaskInput {
  title: string
  estimate?: number // in minutes
  categoryName?: string
  priority: TaskPriority
}

export function parseShortSyntax(input: string): ParsedTaskInput {
  let text = input.trim()
  let estimate: number | undefined
  let categoryName: string | undefined
  let priority: TaskPriority = 'medium'

  // Extract priority: !high, !med, !low or !h, !m, !l
  const priorityMatch = text.match(/(?:^|\s)!([a-zA-Z]+)(?=\s|$)/)
  if (priorityMatch) {
    const p = priorityMatch[1].toLowerCase()
    if (p === 'high' || p === 'h') priority = 'high'
    else if (p === 'low' || p === 'l') priority = 'low'
    else if (p === 'med' || p === 'medium' || p === 'm') priority = 'medium'
    text = text.replace(priorityMatch[0], '')
  }

  // Extract category: #category
  const categoryMatch = text.match(/(?:^|\s)#([a-zA-Z0-9_-]+)(?=\s|$)/)
  if (categoryMatch) {
    categoryName = categoryMatch[1]
    text = text.replace(categoryMatch[0], '')
  }

  // Extract duration / estimate: e.g. 1h30m, 2h, 45m, 90min
  const durationMatch = text.match(/(?:^|\s)(\d+h\d+m|\d+h|\d+m|\d+min)(?=\s|$)/i)
  if (durationMatch) {
    const raw = durationMatch[1].toLowerCase()
    let mins = 0
    if (raw.includes('h') && raw.includes('m')) {
      const parts = raw.split('h')
      const h = parseInt(parts[0], 10) || 0
      const m = parseInt(parts[1].replace('m', ''), 10) || 0
      mins = h * 60 + m
    } else if (raw.endsWith('h')) {
      mins = (parseInt(raw, 10) || 0) * 60
    } else if (raw.endsWith('min') || raw.endsWith('m')) {
      mins = parseInt(raw.replace('min', '').replace('m', ''), 10) || 0
    }
    if (mins > 0) {
      estimate = mins
    }
    text = text.replace(durationMatch[0], '')
  }

  // Clean up title
  const cleanTitle = text.replace(/\s+/g, ' ').trim()

  return {
    title: cleanTitle || input.trim(),
    estimate,
    categoryName,
    priority,
  }
}
