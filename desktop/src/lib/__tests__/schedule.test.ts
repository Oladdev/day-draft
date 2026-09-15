import test from 'node:test'
import assert from 'node:assert/strict'
import { parseShortSyntax } from '../parse.ts'
import { resolveItemForDate } from '../recurrence.ts'
import { layoutDay } from '../schedule.ts'
import type { ScheduleItem, Settings } from '../types.ts'

test('parseShortSyntax: extracts title, estimate, category and priority correctly', () => {
  const res1 = parseShortSyntax('Finish compiler assignment 1h30m #academics !high')
  assert.equal(res1.title, 'Finish compiler assignment')
  assert.equal(res1.estimate, 90)
  assert.equal(res1.categoryName, 'academics')
  assert.equal(res1.priority, 'high')

  const res2 = parseShortSyntax('Quick email check 15m !low')
  assert.equal(res2.title, 'Quick email check')
  assert.equal(res2.estimate, 15)
  assert.equal(res2.priority, 'low')

  const res3 = parseShortSyntax('Read documentation 45min')
  assert.equal(res3.title, 'Read documentation')
  assert.equal(res3.estimate, 45)
  assert.equal(res3.priority, 'medium')
})

test('recurrence: resolves weekly items on matching days of week', () => {
  const weeklyClass: ScheduleItem = {
    id: 'class-1',
    type: 'class',
    title: 'Data Structures',
    startTime: '09:00',
    duration: 90,
    recurrence: { type: 'weekly', days: [1, 3, 5] }, // Mon, Wed, Fri
    color: 'emerald',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  }

  // 2026-09-14 is a Monday (day 1)
  const mon = resolveItemForDate(weeklyClass, '2026-09-14')
  assert.ok(mon !== null)
  assert.equal(mon.startTime, '09:00')
  assert.equal(mon.duration, 90)

  // 2026-09-15 is a Tuesday (day 2) -> should NOT match
  const tue = resolveItemForDate(weeklyClass, '2026-09-15')
  assert.equal(tue, null)

  // 2026-09-16 is a Wednesday (day 3) -> should match
  const wed = resolveItemForDate(weeklyClass, '2026-09-16')
  assert.ok(wed !== null)
})

test('recurrence: respects per-date skip overrides', () => {
  const dailyRoutine: ScheduleItem = {
    id: 'routine-1',
    type: 'routine',
    title: 'Morning Run',
    duration: 30,
    recurrence: { type: 'daily' },
    color: 'amber',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  }

  // Without override: occurs
  const occ1 = resolveItemForDate(dailyRoutine, '2026-09-14', [])
  assert.ok(occ1 !== null)

  // With skip override on that date: does NOT occur
  const occ2 = resolveItemForDate(dailyRoutine, '2026-09-14', [
    { id: 'ov-1', itemId: 'routine-1', date: '2026-09-14', action: 'skip' },
  ])
  assert.equal(occ2, null)
})

test('layoutDay: places fixed classes and auto-fits routines into free gaps', () => {
  const settings: Settings = {
    dayStart: 480, // 8:00 AM
    dayEnd: 1200, // 8:00 PM
    targetFreeMin: 120,
    endOfDayReviewAt: 1260,
    onboardingComplete: true,
  }

  const items: ScheduleItem[] = [
    {
      id: 'lecture-1',
      type: 'class',
      title: 'Operating Systems',
      startTime: '09:00',
      duration: 90,
      recurrence: { type: 'daily' },
      color: 'emerald',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    },
    {
      id: 'routine-1',
      type: 'routine',
      title: 'Coding Focus',
      duration: 60,
      preferredStart: '10:30',
      preferredEnd: '14:00',
      recurrence: { type: 'daily' },
      color: 'teal',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    },
  ]

  const layout = layoutDay(items, '2026-09-14', settings)
  assert.equal(layout.placed.length, 2)
  assert.equal(layout.committedMin, 150)
  assert.ok(layout.freeMin > 0)
  assert.equal(layout.conflicts.length, 0)
})
