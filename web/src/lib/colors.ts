/**
 * Color system tuned for an emerald-forward aesthetic.
 * Rich emeralds, crisp slates, calm accents.
 */

import type { ItemType, TaskPriority } from './types'

export interface ItemColorUi {
  bg: string
  border: string
  text: string
  badge: string
  dot: string
}

export const ITEM_TYPE_COLORS: Record<ItemType, ItemColorUi> = {
  class: {
    bg: 'bg-emerald-50 hover:bg-emerald-100/70',
    border: 'border-l-emerald-500 border-slate-200',
    text: 'text-emerald-900',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  meeting: {
    bg: 'bg-teal-50 hover:bg-teal-100/70',
    border: 'border-l-teal-500 border-slate-200',
    text: 'text-teal-900',
    badge: 'bg-teal-100 text-teal-800 border-teal-200',
    dot: 'bg-teal-500',
  },
  event: {
    bg: 'bg-sky-50 hover:bg-sky-100/70',
    border: 'border-l-sky-500 border-slate-200',
    text: 'text-sky-900',
    badge: 'bg-sky-100 text-sky-800 border-sky-200',
    dot: 'bg-sky-500',
  },
  routine: {
    bg: 'bg-amber-50 hover:bg-amber-100/70',
    border: 'border-l-amber-500 border-slate-200',
    text: 'text-amber-900',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  reading: {
    bg: 'bg-indigo-50 hover:bg-indigo-100/70',
    border: 'border-l-indigo-500 border-slate-200',
    text: 'text-indigo-900',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    dot: 'bg-indigo-500',
  },
}

export const PRIORITY_COLORS: Record<TaskPriority, { dot: string; badge: string }> = {
  high: {
    dot: 'bg-rose-500',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  medium: {
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  low: {
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
  },
}

export const BRAND = {
  primary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all',
  primaryGhost: 'hover:bg-emerald-50 text-emerald-700 transition-colors',
  outline: 'border border-emerald-300 text-emerald-700 hover:bg-emerald-50',
  card: 'bg-white rounded-xl border border-slate-200 shadow-sm',
}
