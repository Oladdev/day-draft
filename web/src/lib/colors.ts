import type { Energy } from './types'

// Energy routing colors (pillar 2): High Focus = violet, Medium = sky, Admin = amber.
export interface EnergyUi {
  chip: string
  dot: string
  accent: string // left border on a block card
  soft: string // block card background
  ring: string
}

export const ENERGY_UI: Record<Energy, EnergyUi> = {
  alpha: {
    chip: 'bg-violet-100 text-violet-700 border-violet-200',
    dot: 'bg-violet-500',
    accent: 'border-l-violet-500',
    soft: 'bg-violet-50',
    ring: 'ring-violet-300',
  },
  medium: {
    chip: 'bg-sky-100 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
    accent: 'border-l-sky-500',
    soft: 'bg-sky-50',
    ring: 'ring-sky-300',
  },
  admin: {
    chip: 'bg-amber-100 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    accent: 'border-l-amber-500',
    soft: 'bg-amber-50',
    ring: 'ring-amber-300',
  },
}

// Category colors resolve to a tailwind family (safelisted in tailwind.config.js).
export const catDot = (family?: string): string => (family ? `bg-${family}-500` : 'bg-slate-400')
export const catText = (family?: string): string => (family ? `text-${family}-700` : 'text-slate-500')

export const PRIORITY_UI: Record<string, string> = {
  high: 'text-rose-600',
  med: 'text-amber-600',
  low: 'text-slate-400',
}
