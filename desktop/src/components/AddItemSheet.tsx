import { useState, useEffect } from 'react'
import {
  X,
  BookOpen,
  Users,
  Calendar,
  Repeat,
  BookMarked,
  CheckSquare,
  Check,
  Clock,
  Sparkles,
  CalendarDays,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react'
import type { ItemType, TaskPriority } from '../lib/types'
import { ITEM_TYPE_LABEL } from '../lib/types'
import { useStore } from '../store'
import { todayISO } from '../lib/time'
import { useIsMobile } from '../lib/useIsMobile'

type AddMode = ItemType | 'task'

interface TypeOption {
  type: AddMode
  label: string
  desc: string
  icon: typeof BookOpen
  color: string
  bgColor: string
  borderColor: string
}

const TYPE_OPTIONS: TypeOption[] = [
  {
    type: 'class',
    label: 'Class',
    desc: 'Lectures, labs & academic periods',
    icon: BookOpen,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    type: 'meeting',
    label: 'Meeting',
    desc: 'Team standups, calls & 1-on-1s',
    icon: Users,
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
  },
  {
    type: 'routine',
    label: 'Routine',
    desc: 'Habits, coding blocks & workouts',
    icon: Repeat,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    type: 'reading',
    label: 'Reading',
    desc: 'Books, technical papers & chapters',
    icon: BookMarked,
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  {
    type: 'event',
    label: 'Event',
    desc: 'Exams, milestones & special dates',
    icon: Calendar,
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
  },
  {
    type: 'task',
    label: 'Task',
    desc: 'Actionable to-dos with backlog tracking',
    icon: CheckSquare,
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
  },
]

const DOW_OPTIONS = [
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
  { day: 0, label: 'Sun' },
]

export function AddItemSheet() {
  const isMobile = useIsMobile(640)
  const addSheetOpen = useStore((s) => s.addSheetOpen)
  const setAddSheet = useStore((s) => s.setAddSheet)
  const addItem = useStore((s) => s.addItem)
  const addTask = useStore((s) => s.addTask)
  const boardColumns = useStore((s) => s.boardColumns)
  const activeDate = useStore((s) => s.date)

  const [step, setStep] = useState<number>(0)
  const [mode, setMode] = useState<AddMode>('class')

  // Common Fields
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState(60)
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')

  // Date & Recurrence
  // 'single' = single specific date, 'weekly' = selected days, 'daily' = every day
  const [scheduleKind, setScheduleKind] = useState<'single' | 'weekly' | 'daily'>('single')
  const [specificDate, setSpecificDate] = useState(activeDate || todayISO())
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 5]) // Mon, Wed, Fri default

  // Time behavior for routines/reading: fixed vs flexible
  const [timeMode, setTimeMode] = useState<'fixed' | 'flexible'>('fixed')
  const [startTime, setStartTime] = useState('09:00')
  const [preferredWindow, setPreferredWindow] = useState<'morning' | 'afternoon' | 'evening'>('morning')

  // Reading Specifics
  const [readingGoal, setReadingGoal] = useState('')

  // Task Specifics
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium')
  const [taskColumnId, setTaskColumnId] = useState(boardColumns[0]?.id || 'backlog')
  const [taskDate, setTaskDate] = useState(activeDate || todayISO())
  const [scheduleTaskNow, setScheduleTaskNow] = useState(false)

  // Reset step on sheet open
  useEffect(() => {
    if (addSheetOpen) {
      setStep(isMobile ? 0 : 1)
      setSpecificDate(activeDate || todayISO())
      setTaskDate(activeDate || todayISO())
    }
  }, [addSheetOpen, isMobile, activeDate])

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && addSheetOpen) {
        setAddSheet(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [addSheetOpen, setAddSheet])

  if (!addSheetOpen) return null

  const toggleDay = (d: number) => {
    if (selectedDays.includes(d)) {
      setSelectedDays(selectedDays.filter((x) => x !== d))
    } else {
      setSelectedDays([...selectedDays, d].sort())
    }
  }

  const handleSelectMode = (newMode: AddMode) => {
    setMode(newMode)
    if (newMode === 'routine' || newMode === 'reading') {
      setTimeMode('flexible')
      setScheduleKind('daily')
    } else if (newMode === 'class') {
      setTimeMode('fixed')
      setScheduleKind('weekly')
    } else if (newMode === 'meeting' || newMode === 'event') {
      setTimeMode('fixed')
      setScheduleKind('single')
    }
    if (isMobile) {
      setStep(1)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    if (mode === 'task') {
      addTask({
        title: title.trim(),
        notes: notes.trim() || undefined,
        estimate: Number(duration) || 30,
        priority: taskPriority,
        status: taskColumnId === 'done' ? 'done' : 'todo',
        columnId: taskColumnId,
        scheduledDate: scheduleTaskNow ? taskDate : undefined,
      })
    } else {
      // Color assignments
      const color =
        mode === 'class'
          ? 'emerald'
          : mode === 'meeting'
          ? 'teal'
          : mode === 'routine'
          ? 'amber'
          : mode === 'reading'
          ? 'indigo'
          : 'sky'

      let pStart: string | undefined
      let pEnd: string | undefined

      if (timeMode === 'flexible') {
        if (preferredWindow === 'morning') {
          pStart = '07:00'
          pEnd = '12:00'
        } else if (preferredWindow === 'afternoon') {
          pStart = '12:00'
          pEnd = '18:00'
        } else {
          pStart = '18:00'
          pEnd = '22:30'
        }
      }

      const isFixedTime = timeMode === 'fixed'

      let recurrenceConfig = undefined
      let dateConfig = undefined

      if (scheduleKind === 'daily') {
        recurrenceConfig = { type: 'daily' as const }
      } else if (scheduleKind === 'weekly') {
        recurrenceConfig = {
          type: 'weekly' as const,
          days: selectedDays.length > 0 ? selectedDays : [1],
        }
      } else {
        // Specific single date
        dateConfig = specificDate || todayISO()
      }

      const formattedNotes =
        mode === 'reading' && readingGoal.trim()
          ? `Target: ${readingGoal.trim()}${notes ? ` · ${notes.trim()}` : ''}`
          : notes.trim() || undefined

      addItem({
        type: mode,
        title: title.trim(),
        startTime: isFixedTime ? startTime : undefined,
        duration: Number(duration) || 60,
        location: location.trim() || undefined,
        notes: formattedNotes,
        color,
        date: dateConfig,
        recurrence: recurrenceConfig,
        preferredStart: pStart,
        preferredEnd: pEnd,
      })
    }

    // Reset and close
    setTitle('')
    setLocation('')
    setNotes('')
    setReadingGoal('')
    setAddSheet(false)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-sheet-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      onClick={() => setAddSheet(false)}
    >
      <div
        className="w-full sm:max-w-xl max-h-[92vh] sm:max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Bar */}
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-slate-300 sm:hidden" />

        {/* Mobile Sequential Wizard Header */}
        {isMobile && step === 0 ? (
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600">
                Step 1 of 2
              </span>
              <h2 id="add-sheet-title" className="text-lg font-bold text-slate-900">
                What are you adding?
              </h2>
            </div>
            <button
              onClick={() => setAddSheet(false)}
              aria-label="Close dialog"
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              {isMobile && (
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  aria-label="Back to type selection"
                  className="rounded-xl p-1 text-slate-500 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              <div>
                <h2 id="add-sheet-title" className="text-lg font-bold text-slate-900">
                  {isMobile ? `New ${mode === 'task' ? 'Task' : ITEM_TYPE_LABEL[mode]}` : 'What would you like to add?'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isMobile ? 'Fill in the schedule details below' : 'Choose an item type to customize its schedule'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setAddSheet(false)}
              aria-label="Close dialog"
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* MOBILE STEP 0: TYPE SELECTION TILES */}
        {isMobile && step === 0 ? (
          <div className="mt-4 space-y-2.5">
            {TYPE_OPTIONS.map((opt) => {
              const Icon = opt.icon
              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => handleSelectMode(opt.type)}
                  className={`flex w-full items-center justify-between rounded-2xl border p-3.5 transition-all text-left min-h-[56px] ${
                    mode === opt.type
                      ? `${opt.borderColor} ${opt.bgColor} ring-2 ring-emerald-500/20`
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${opt.borderColor} ${opt.bgColor} ${opt.color}`}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{opt.label}</div>
                      <div className="text-xs text-slate-500">{opt.desc}</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>
              )
            })}
          </div>
        ) : (
          <>
            {/* Desktop Horizontal Type Selector Tabs */}
            {!isMobile && (
              <div className="mt-4 grid grid-cols-6 gap-1.5 rounded-2xl bg-slate-100 p-1.5" role="tablist">
                {TYPE_OPTIONS.map((opt) => {
                  const Icon = opt.icon
                  const active = mode === opt.type
                  return (
                    <button
                      key={opt.type}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => handleSelectMode(opt.type)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-1 text-xs font-bold transition-all min-h-[44px] ${
                        active
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Icon size={16} className={active ? opt.color : ''} />
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              {mode === 'class'
                ? 'Course Title'
                : mode === 'meeting'
                ? 'Meeting Subject'
                : mode === 'reading'
                ? 'Book / Paper / Reading Title'
                : mode === 'routine'
                ? 'Routine Name'
                : mode === 'task'
                ? 'Task Title'
                : 'Event Name'}
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                mode === 'class'
                  ? 'e.g. Distributed Systems & Algorithms'
                  : mode === 'meeting'
                  ? 'e.g. Project Sprint Planning'
                  : mode === 'reading'
                  ? 'e.g. Designing Data-Intensive Applications'
                  : mode === 'routine'
                  ? 'e.g. Morning Programming Session'
                  : mode === 'task'
                  ? 'e.g. Complete Lab 3 submission'
                  : 'e.g. Midterm Examination'
              }
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Reading Target Goal */}
          {mode === 'reading' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Reading Target / Scope
              </label>
              <input
                type="text"
                value={readingGoal}
                onChange={(e) => setReadingGoal(e.target.value)}
                placeholder="e.g. Chapter 4: Storage Engines or 30 pages"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          )}

          {/* SCHEDULE KIND SELECTION (Classes, Meetings, Events, Routines, Reading) */}
          {mode !== 'task' && (
            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                When should this happen?
              </label>

              {/* Kind Options: Single Day vs Weekly Repeating vs Daily */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleKind('single')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold border transition-all ${
                    scheduleKind === 'single'
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <CalendarDays size={13} />
                  Single Day
                </button>

                <button
                  type="button"
                  onClick={() => setScheduleKind('weekly')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold border transition-all ${
                    scheduleKind === 'weekly'
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Repeat size={13} />
                  Weekly
                </button>

                <button
                  type="button"
                  onClick={() => setScheduleKind('daily')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold border transition-all ${
                    scheduleKind === 'daily'
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles size={13} />
                  Daily
                </button>
              </div>

              {/* Single Day Date Picker */}
              {scheduleKind === 'single' && (
                <div className="pt-1">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Select Date
                  </label>
                  <input
                    type="date"
                    required
                    value={specificDate}
                    onChange={(e) => setSpecificDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                  />
                </div>
              )}

              {/* Weekly Day of Week Picker */}
              {scheduleKind === 'weekly' && (
                <div className="pt-1">
                  <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
                    Repeat on which days?
                  </p>
                  <div className="flex gap-1">
                    {DOW_OPTIONS.map(({ day, label }) => {
                      const active = selectedDays.includes(day)
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                            active
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TIME MODE (Routines & Reading support both fixed time and flexible window!) */}
          {mode !== 'task' && (
            <div className="space-y-3">
              {(mode === 'routine' || mode === 'reading') && (
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-200">
                  <span className="text-xs font-bold text-slate-700">Timing Preference:</span>
                  <div className="flex rounded-lg bg-slate-200 p-0.5 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setTimeMode('fixed')}
                      className={`rounded-md px-2.5 py-1 transition-colors ${
                        timeMode === 'fixed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Fixed Clock Time
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeMode('flexible')}
                      className={`rounded-md px-2.5 py-1 transition-colors ${
                        timeMode === 'flexible' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Flexible Gap Fit
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {timeMode === 'fixed' || (mode !== 'routine' && mode !== 'reading') ? (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Start Time
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        required
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Preferred Window
                    </label>
                    <select
                      value={preferredWindow}
                      onChange={(e) => setPreferredWindow(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                    >
                      <option value="morning">Morning (7 AM - 12 PM)</option>
                      <option value="afternoon">Afternoon (12 PM - 6 PM)</option>
                      <option value="evening">Evening (6 PM - 10:30 PM)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1 hr 30 min</option>
                    <option value={120}>2 hours</option>
                    <option value={180}>3 hours</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TASK SPECIFIC FIELDS */}
          {mode === 'task' && (
            <div className="space-y-3.5 rounded-2xl bg-slate-50 p-3.5 border border-slate-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 bg-white"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority (!high)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Board Column
                  </label>
                  <select
                    value={taskColumnId}
                    onChange={(e) => setTaskColumnId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 bg-white"
                  >
                    {boardColumns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Estimated Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 bg-white"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="scheduleTaskCheckbox"
                  checked={scheduleTaskNow}
                  onChange={(e) => setScheduleTaskNow(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="scheduleTaskCheckbox" className="text-xs font-medium text-slate-700">
                  Plan for a specific date
                </label>
              </div>

              {scheduleTaskNow && (
                <input
                  type="date"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 bg-white"
                />
              )}
            </div>
          )}

          {/* Location / Link (For Classes, Meetings, Events) */}
          {(mode === 'class' || mode === 'meeting' || mode === 'event') && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Location or Video Link
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={
                  mode === 'class' ? 'e.g. Science Complex Room 204' : 'e.g. Google Meet / Zoom link'
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          )}

          {/* Notes / Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Notes / Description (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details, agenda, reading notes, or context..."
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAddSheet(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-colors min-h-[44px]"
              >
                <Check size={16} /> Save {mode === 'task' ? 'Task' : ITEM_TYPE_LABEL[mode]}
              </button>
            </div>
          </form>
        </>
        )}
      </div>
    </div>
  )
}
