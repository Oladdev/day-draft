import type { Block, Category, DayTemplate, Settings, Task } from './types'
import { uid } from './id'
import { parseHHMM, todayISO } from './time'

export const CATEGORIES: Category[] = [
  { id: 'cat-class', name: 'Class', color: 'indigo' },
  { id: 'cat-coding', name: 'Coding', color: 'violet' },
  { id: 'cat-reading', name: 'Reading', color: 'sky' },
  { id: 'cat-meeting', name: 'Meeting', color: 'rose' },
  { id: 'cat-admin', name: 'Admin', color: 'amber' },
  { id: 'cat-life', name: 'Life', color: 'emerald' },
]

export const DEFAULT_SETTINGS: Settings = {
  dayStartMin: parseHHMM('06:00'),
  morningEndMin: parseHHMM('12:00'),
  afternoonEndMin: parseHHMM('18:00'),
  dayEndMin: parseHHMM('23:00'),
  targetFreeMin: 120,
}

// Pillar 3 — Ideal Day templates. Routine blocks auto-fill open gaps of their
// phase; anchors (with a startMin) drop onto their hard time.
export const TEMPLATES: DayTemplate[] = [
  {
    id: 'tpl-lecture',
    name: 'Lecture-Heavy Day',
    description: 'Classes anchor the day; deep work and reading fill the gaps.',
    blocks: [
      { title: 'Review notes', kind: 'routine', energy: 'medium', phase: 'morning', durationMin: 45, categoryId: 'cat-class' },
      { title: 'Deep Work / Coding', kind: 'routine', energy: 'alpha', phase: 'afternoon', durationMin: 90, categoryId: 'cat-coding' },
      { title: 'Admin Sweep', kind: 'routine', energy: 'admin', phase: 'afternoon', durationMin: 30, categoryId: 'cat-admin' },
      { title: 'Evening Reading', kind: 'routine', energy: 'medium', phase: 'night', durationMin: 45, categoryId: 'cat-reading' },
    ],
  },
  {
    id: 'tpl-dev',
    name: 'Open Dev Day',
    description: 'Long uninterrupted focus blocks for building.',
    blocks: [
      { title: 'Deep Work / Coding', kind: 'routine', energy: 'alpha', phase: 'morning', durationMin: 120, categoryId: 'cat-coding' },
      { title: 'Deep Work / Coding', kind: 'routine', energy: 'alpha', phase: 'afternoon', durationMin: 90, categoryId: 'cat-coding' },
      { title: 'Admin Sweep', kind: 'routine', energy: 'admin', phase: 'afternoon', durationMin: 30, categoryId: 'cat-admin' },
      { title: 'Evening Reading', kind: 'routine', energy: 'medium', phase: 'night', durationMin: 45, categoryId: 'cat-reading' },
    ],
  },
  {
    id: 'tpl-weekend',
    name: 'Weekend Recovery',
    description: 'Lighter load — rest, reading, and a little movement.',
    blocks: [
      { title: 'Slow Reading', kind: 'routine', energy: 'medium', phase: 'morning', durationMin: 60, categoryId: 'cat-reading' },
      { title: 'Gym / Move', kind: 'routine', energy: 'medium', phase: 'afternoon', durationMin: 60, categoryId: 'cat-life' },
      { title: 'Rest / Reset', kind: 'routine', energy: 'admin', phase: 'night', durationMin: 45, categoryId: 'cat-life' },
    ],
  },
]

/** A small starter day so the app looks alive on first run. */
export function seedToday(): { blocks: Block[]; tasks: Task[] } {
  const date = todayISO()
  const now = Date.now()
  const blocks: Block[] = [
    {
      id: uid(), title: 'Data Structures — Lecture', kind: 'anchor', energy: 'medium',
      categoryId: 'cat-class', date, startMin: parseHHMM('09:00'), durationMin: 90,
      status: 'planned', createdAt: now, order: 0,
    },
    {
      id: uid(), title: 'Team Standup', kind: 'anchor', energy: 'admin',
      categoryId: 'cat-meeting', date, startMin: parseHHMM('13:00'), durationMin: 30,
      status: 'planned', createdAt: now, order: 0,
    },
    {
      id: uid(), title: 'Deep Work / Coding', kind: 'routine', energy: 'alpha',
      categoryId: 'cat-coding', date, durationMin: 90, phase: 'morning',
      status: 'planned', createdAt: now, order: 1,
    },
    {
      id: uid(), title: 'Deep Work / Coding', kind: 'routine', energy: 'alpha',
      categoryId: 'cat-coding', date, durationMin: 90, phase: 'afternoon',
      status: 'planned', createdAt: now, order: 1,
    },
    {
      id: uid(), title: 'Evening Reading', kind: 'routine', energy: 'medium',
      categoryId: 'cat-reading', date, durationMin: 45, phase: 'night',
      status: 'planned', createdAt: now, order: 1,
    },
  ]

  const codingBlockId = blocks.find((b) => b.title.includes('Coding'))!.id
  const tasks: Task[] = [
    { id: uid(), title: 'Fix auth token refresh bug', energy: 'alpha', priority: 'high', estimateMin: 60, status: 'todo', blockId: codingBlockId, createdAt: now },
    { id: uid(), title: 'Draft committee minutes', energy: 'admin', priority: 'med', estimateMin: 20, status: 'todo', createdAt: now },
    { id: uid(), title: 'Reply to advisor email', energy: 'admin', priority: 'med', estimateMin: 10, status: 'todo', createdAt: now },
    { id: uid(), title: 'Read chapter 4', energy: 'medium', priority: 'low', estimateMin: 45, status: 'todo', createdAt: now },
  ]

  return { blocks, tasks }
}
