/**
 * Color palettes for mobile UI items
 */
import type { ItemType } from './types'

export interface ColorScheme {
  bg: string
  text: string
  border: string
  badgeBg: string
  badgeText: string
  dot: string
}

export const ITEM_TYPE_COLORS: Record<ItemType, ColorScheme> = {
  class: {
    bg: '#eff6ff',
    text: '#1e40af',
    border: '#3b82f6',
    badgeBg: '#dbeafe',
    badgeText: '#1e40af',
    dot: '#2563eb',
  },
  meeting: {
    bg: '#eef2ff',
    text: '#3730a3',
    border: '#6366f1',
    badgeBg: '#e0e7ff',
    badgeText: '#3730a3',
    dot: '#4f46e5',
  },
  event: {
    bg: '#fdf4ff',
    text: '#86198f',
    border: '#d946ef',
    badgeBg: '#fae8ff',
    badgeText: '#86198f',
    dot: '#c026d3',
  },
  routine: {
    bg: '#ecfdf5',
    text: '#065f46',
    border: '#10b981',
    badgeBg: '#d1fae5',
    badgeText: '#065f46',
    dot: '#059669',
  },
  reading: {
    bg: '#fffbeb',
    text: '#92400e',
    border: '#f59e0b',
    badgeBg: '#fef3c7',
    badgeText: '#92400e',
    dot: '#d97706',
  },
}
