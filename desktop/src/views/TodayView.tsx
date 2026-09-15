import { useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Flame,
  Calendar,
  AlertTriangle,
  Clock,
  MapPin,
  Sparkles,
  Zap,
  Moon,
} from 'lucide-react'
import { useStore } from '../store'
import { layoutDay } from '../lib/schedule'
import { todayISO, addDaysISO, prettyDate, longDate, fmtDur, to12h } from '../lib/time'
import { FocusHUD } from '../components/FocusHUD'
import { TaskCard } from '../components/TaskCard'
import { ITEM_TYPE_COLORS, ITEM_TYPE_COLORS as _colors } from '../lib/colors'

export function TodayView() {
  const items = useStore((s) => s.items)
  const tasks = useStore((s) => s.tasks)
  const overrides = useStore((s) => s.overrides)
  const settings = useStore((s) => s.settings)
  const activeDate = useStore((s) => s.date)
  const setDate = useStore((s) => s.setDate)
  const setAddSheet = useStore((s) => s.setAddSheet)
  const setCapture = useStore((s) => s.setCapture)
  const setEndOfDay = useStore((s) => s.setEndOfDay)
  const setEditModalItem = useStore((s) => s.setEditModalItem)
  const resetToSampleData = useStore((s) => s.resetToSampleData)
  const startFocus = useStore((s) => s.startFocus)
  const skipOccurrence = useStore((s) => s.skipOccurrence)
  const planTask = useStore((s) => s.planTask)
  const user = useStore((s) => s.user)
  const setUserModalOpen = useStore((s) => s.setUserModalOpen)

  const isToday = activeDate === todayISO()

  // Compute schedule layout for the active date
  const layout = useMemo(
    () => layoutDay(items, activeDate, settings, overrides),
    [items, activeDate, settings, overrides]
  )

  // Tasks scheduled for this date + unassigned inbox tasks
  const todayTasks = tasks.filter((t) => t.scheduledDate === activeDate)
  const inboxTasks = tasks.filter((t) => !t.scheduledDate && t.status !== 'done')

  const handleTaskDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      planTask(taskId, activeDate)
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-y-auto bg-slate-50/50 pb-20 lg:pb-0 select-none">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 py-3.5 backdrop-blur-sm shadow-xs shrink-0">
        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDate(addDaysISO(activeDate, -1))}
            className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={() => setDate(todayISO())}
            className={`rounded-xl px-3 py-1.5 text-left transition-colors ${
              isToday ? 'bg-emerald-50 text-emerald-900 font-bold' : 'hover:bg-slate-100'
            }`}
          >
            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
              {isToday ? 'Today' : prettyDate(activeDate)}
              {isToday && (
                <span className="rounded-md bg-emerald-600 px-1.5 py-0.2 text-[10px] font-extrabold uppercase tracking-wider text-white">
                  Live
                </span>
              )}
            </div>
            <div className="text-[11px] font-medium text-slate-400">{longDate(activeDate)}</div>
          </button>

          <button
            onClick={() => setDate(addDaysISO(activeDate, 1))}
            className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Next Day"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* User Account Trigger */}
          <button
            onClick={() => setUserModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 min-h-[36px]"
            title="User Profile & Settings"
            aria-label="User Profile & Settings"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white font-bold">
              {user?.avatarUrl || user?.name?.charAt(0).toUpperCase() || '👤'}
            </span>
            <span className="hidden sm:inline">{user?.name || 'Guest'}</span>
          </button>

          {/* Day Review Trigger (Mobile & Desktop) */}
          <button
            onClick={() => setEndOfDay(true)}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200/80 bg-indigo-50/60 px-3 py-1.5 text-xs font-bold text-indigo-900 hover:bg-indigo-100 transition-colors"
            title="End of Day Review"
          >
            <Moon size={14} className="text-indigo-600" />
            <span>Review</span>
          </button>

          <button
            onClick={() => setCapture(true)}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Zap size={14} className="text-amber-500" />
            Quick Task
          </button>

          <button
            onClick={() => setAddSheet(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 sm:px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-colors"
          >
            <Plus size={16} />
            <span className="hidden xs:inline">Add</span> Schedule Item
          </button>
        </div>
      </header>

      {/* Capacity & Balance Bar */}
      <div className="border-b border-slate-200/60 bg-white px-4 sm:px-6 py-2.5 sm:py-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Committed:</span>{' '}
              <span className="font-bold text-slate-800">{fmtDur(layout.committedMin)}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Free:</span>{' '}
              <span className={`font-bold ${layout.freeMin < 60 ? 'text-amber-600' : 'text-emerald-700'}`}>
                {fmtDur(layout.freeMin)}
              </span>
            </div>
            {layout.conflicts.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200">
                <AlertTriangle size={12} /> {layout.conflicts.length} Conflict
              </span>
            )}
            {layout.isOverloaded && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800">
                Overloaded
              </span>
            )}
          </div>

          {/* Capacity Progress Bar */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">Day Load:</span>
            <div className="h-2 w-24 sm:w-32 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  layout.capacityPct > 100
                    ? 'bg-rose-500'
                    : layout.capacityPct > 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, layout.capacityPct)}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-700">{layout.capacityPct}%</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 min-h-0">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Active Focus Session Banner if engaged */}
          <FocusHUD />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_22rem]">
            {/* Left Column: Timeline Schedule */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Today's Schedule & Commitments
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {layout.placed.length + todayTasks.length} planned items
                </span>
              </div>

              {layout.placed.length === 0 && todayTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 sm:p-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3">
                    <Calendar size={24} />
                  </div>
                  <h4 className="text-base font-bold text-slate-800">No events or tasks scheduled for this day</h4>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm">
                    Classes, meetings, routines, reading, and planned tasks will automatically appear here.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => setAddSheet(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-sm transition-colors"
                    >
                      <Plus size={14} /> Add First Item
                    </button>
                    {items.length === 0 && (
                      <button
                        onClick={resetToSampleData}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                      >
                        <Sparkles size={14} className="text-emerald-600" /> Load Academic Preset
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Placed Schedule Items (Classes, Meetings, Routines, Reading, Events) */}
                  {layout.placed.map((item) => {
                    const typeUi = ITEM_TYPE_COLORS[item.type]
                    return (
                      <div
                        key={item.id}
                        onClick={() => setEditModalItem({ item: item.item, itemType: 'schedule' })}
                        className={`group relative flex items-start justify-between rounded-2xl border-l-4 bg-white p-4 shadow-2xs transition-all hover:shadow-md cursor-pointer ${typeUi.border}`}
                        title="Click to view and edit details"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0 pr-3 sm:pr-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide border ${typeUi.badge}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${typeUi.dot}`} />
                              {item.type}
                            </span>

                            {item.isRoutinePlaced && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                <Sparkles size={11} /> Auto-fitted routine
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                            {item.title}
                          </h4>

                          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                              <Clock size={13} className="text-slate-400" />
                              {to12h(item.startMin)} – {to12h(item.endMin)} ({fmtDur(item.durationMin)})
                            </span>

                            {item.location && (
                              <span className="inline-flex items-center gap-1 text-slate-600">
                                <MapPin size={13} className="text-slate-400" />
                                {item.location}
                              </span>
                            )}
                          </div>

                          {item.notes && (
                            <p className="text-xs text-slate-500 italic pt-0.5 line-clamp-2">{item.notes}</p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() =>
                              startFocus(item.item.id, 'item', item.title, item.durationMin)
                            }
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                            title="Focus on this session"
                          >
                            <Flame size={13} className="text-emerald-600" />
                            Focus
                          </button>

                          {item.item.recurrence && (
                            <button
                              onClick={() => skipOccurrence(item.item.id, activeDate)}
                              className="hidden sm:inline-block rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                              title="Skip this occurrence today"
                            >
                              Skip
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {/* Tasks Planned For Today — Styled Consistently With Schedule Items */}
                  {todayTasks.map((t) => {
                    const isDone = t.status === 'done'
                    return (
                      <div
                        key={t.id}
                        onClick={() => setEditModalItem({ item: t, itemType: 'task' })}
                        className={`group relative flex items-start justify-between rounded-2xl border-l-4 bg-white p-4 shadow-2xs transition-all hover:shadow-md cursor-pointer ${
                          isDone
                            ? 'border-l-slate-300 opacity-60 bg-slate-50/60'
                            : 'border-l-emerald-500 hover:border-l-emerald-600'
                        }`}
                        title="Click to view and edit task"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0 pr-3 sm:pr-4">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide border bg-emerald-50 text-emerald-800 border-emerald-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Task
                            </span>

                            <span
                              className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                t.priority === 'high'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : t.priority === 'low'
                                  ? 'bg-slate-100 text-slate-600'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {t.priority}
                            </span>
                          </div>

                          <h4
                            className={`text-sm sm:text-base font-bold leading-snug ${
                              isDone ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {t.title}
                          </h4>

                          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs text-slate-500">
                            {t.estimate && (
                              <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                                <Clock size={13} className="text-slate-400" />
                                {fmtDur(t.estimate)} planned
                              </span>
                            )}
                            {t.tags && t.tags.length > 0 && (
                              <span className="text-emerald-700 font-medium">
                                #{t.tags.join(' #')}
                              </span>
                            )}
                          </div>

                          {t.notes && (
                            <p className="text-xs text-slate-500 italic pt-0.5 line-clamp-2">{t.notes}</p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() =>
                              startFocus(t.id, 'task', t.title, t.estimate || 30)
                            }
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                            title="Focus on this task"
                          >
                            <Flame size={13} className="text-emerald-600" />
                            Focus
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Task Inbox / Backlog */}
            <div className="space-y-4">
              {/* Scheduled Tasks list summary */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleTaskDrop}
                className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Planned For Today ({todayTasks.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">Drag or click to edit</span>
                </div>

                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                  {todayTasks.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                      No tasks assigned to today. Drop from inbox below!
                    </div>
                  ) : (
                    todayTasks.map((t) => <TaskCard key={t.id} task={t} showScheduledDate={false} />)
                  )}
                </div>
              </div>

              {/* Task Inbox / Backlog */}
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Task Inbox ({inboxTasks.length})
                  </h4>
                  <button
                    onClick={() => setCapture(true)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    + Add Task
                  </button>
                </div>

                <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
                  {inboxTasks.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      Task inbox is clear.
                    </div>
                  ) : (
                    inboxTasks.map((t) => <TaskCard key={t.id} task={t} />)
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
