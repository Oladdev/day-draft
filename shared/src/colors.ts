import type { ItemType } from './types'

export interface ItemTypeColorTokens {
  border: string
  bg: string
  text: string
  badge: string
  dot: string
}

export const ITEM_TYPE_COLORS: Record<ItemType, ItemTypeColorTokens> = {
  class: {
    border: 'border-l-blue-500 hover:border-l-blue-600',
    bg: 'bg-blue-50/40 hover:bg-blue-50/70',
    text: 'text-blue-950',
    badge: 'bg-blue-100/80 text-blue-900 border-blue-200',
    dot: 'bg-blue-600',
  },
  meeting: {
    border: 'border-l-indigo-500 hover:border-l-indigo-600',
    bg: 'bg-indigo-50/40 hover:bg-indigo-50/70',
    text: 'text-indigo-950',
    badge: 'bg-indigo-100/80 text-indigo-900 border-indigo-200',
    dot: 'bg-indigo-600',
  },
  event: {
    border: 'border-l-fuchsia-500 hover:border-l-fuchsia-600',
    bg: 'bg-fuchsia-50/40 hover:bg-fuchsia-50/70',
    text: 'text-fuchsia-950',
    badge: 'bg-fuchsia-100/80 text-fuchsia-900 border-fuchsia-200',
    dot: 'bg-fuchsia-600',
  },
  routine: {
    border: 'border-l-emerald-500 hover:border-l-emerald-600',
    bg: 'bg-emerald-50/40 hover:bg-emerald-50/70',
    text: 'text-emerald-950',
    badge: 'bg-emerald-100/80 text-emerald-900 border-emerald-200',
    dot: 'bg-emerald-600',
  },
  reading: {
    border: 'border-l-amber-500 hover:border-l-amber-600',
    bg: 'bg-amber-50/40 hover:bg-amber-50/70',
    text: 'text-amber-950',
    badge: 'bg-amber-100/80 text-amber-900 border-amber-200',
    dot: 'bg-amber-600',
  },
}
