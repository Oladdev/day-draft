import { useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Calendar,
  Check,
  Flame,
  FileText,
} from 'lucide-react'
import { useStore } from '../store'
import { layoutDay } from '../lib/schedule'
import { weekDates, todayISO, addDaysISO, fmtDur, to12h, weekOfMonthInfo, prettyDate } from '../lib/time'
import { ITEM_TYPE_COLORS, PRIORITY_COLORS } from '../lib/colors'
import { ITEM_TYPE_EMOJI, ITEM_TYPE_LABEL } from '../lib/types'

export function WeekView() {
  const items = useStore((s) => s.items)
  const tasks = useStore((s) => s.tasks)
  const overrides = useStore((s) => s.overrides)
  const settings = useStore((s) => s.settings)
  const activeDate = useStore((s) => s.date)
  const setDate = useStore((s) => s.setDate)
  const setView = useStore((s) => s.setView)
  const planTask = useStore((s) => s.planTask)
  const setAddSheet = useStore((s) => s.setAddSheet)
  const setEditModalItem = useStore((s) => s.setEditModalItem)
  const toggleTask = useStore((s) => s.toggleTask)
  const user = useStore((s) => s.user)
  const setUserModalOpen = useStore((s) => s.setUserModalOpen)

  const today = todayISO()
  const days = useMemo(() => weekDates(activeDate), [activeDate])
  const weekInfo = useMemo(() => weekOfMonthInfo(days[0]), [days])

  // Active day tab for mobile screens (default to today if in range, otherwise first day)
  const [mobileSelectedDate, setMobileSelectedDate] = useState<string>(
    days.includes(today) ? today : days[0]
  )

  // Pre-calculate layouts for each day in the week
  const weekLayouts = useMemo(() => {
    return days.map((d) => ({
      date: d,
      layout: layoutDay(items, d, settings, overrides),
      tasks: tasks.filter((t) => t.scheduledDate === d),
    }))
  }, [days, items, settings, overrides, tasks])

  const handleDropOnDay = (date: string, e: React.DragEvent) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      planTask(taskId, date)
    }
  }

  const activeMobileDayData = weekLayouts.find((d) => d.date === mobileSelectedDate) || weekLayouts[0]

  return (
    <div className="flex h-screen flex-col overflow-y-auto bg-slate-50/50 pb-20 lg:pb-0 select-none">
      {/* Header bar */}
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 py-3.5 backdrop-blur-sm shadow-xs shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newDate = addDaysISO(activeDate, -7)
              setDate(newDate)
              setMobileSelectedDate(newDate)
            }}
            className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Previous Week"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={() => {
              setDate(todayISO())
              setMobileSelectedDate(todayISO())
            }}
            className="rounded-xl px-3 py-1 text-left hover:bg-slate-100 transition-colors"
          >
            <div className="text-sm font-bold text-slate-900">{weekInfo.fullLabel}</div>
            <div className="text-[11px] font-semibold text-emerald-700">
              {prettyDate(days[0])} – {prettyDate(days[6])} · 7-Day Overview
            </div>
          </button>

          <button
            onClick={() => {
              const newDate = addDaysISO(activeDate, 7)
              setDate(newDate)
              setMobileSelectedDate(newDate)
            }}
            className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Next Week"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {/* User Profile Button */}
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

          <button
            onClick={() => setAddSheet(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-colors"
          >
            <Plus size={16} /> Add Schedule Item
          </button>
        </div>
      </header>

      {/* MOBILE DAY SELECTOR STRIP (Auto-fit on mobile screens) */}
      <div className="md:hidden border-b border-slate-200 bg-white px-3 py-2 shrink-0">
        <div className="flex gap-1.5 overflow-x-auto py-1">
          {days.map((d) => {
            const isSelected = d === mobileSelectedDate
            const isCurrent = d === today
            const dateObj = new Date(d + 'T12:00:00')
            const dow = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
            const dayNum = dateObj.getDate()

            const dayData = weekLayouts.find((layoutItem) => layoutItem.date === d)
            const count = (dayData?.layout.placed.length || 0) + (dayData?.tasks.length || 0)

            return (
              <button
                key={d}
                onClick={() => setMobileSelectedDate(d)}
                className={`flex flex-col items-center justify-center min-w-12 py-1.5 px-2 rounded-xl border transition-all relative ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-600 text-white font-bold shadow-xs'
                    : isCurrent
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <span className="text-[10px] uppercase">{dow}</span>
                <span className="text-xs font-black">{dayNum}</span>
                {count > 0 && (
                  <span
                    className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-emerald-500'
                    }`}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* MOBILE SINGLE DAY VIEW (100% auto-fit on phone screens) */}
      <div className="md:hidden flex-1 p-4 space-y-3">
        <div className="flex items-center justify-between pb-1">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {prettyDate(activeMobileDayData.date)}
            </h3>
            <span className="text-xs text-slate-400">
              Load: {activeMobileDayData.layout.capacityPct}% ·{' '}
              {activeMobileDayData.layout.placed.length + activeMobileDayData.tasks.length} commitments
            </span>
          </div>
          <button
            onClick={() => {
              setDate(activeMobileDayData.date)
              setView('today')
            }}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            Open in Today View →
          </button>
        </div>

        {/* List of items on mobile */}
        <div className="space-y-2.5">
          {activeMobileDayData.layout.placed.map((item) => {
            const typeUi = ITEM_TYPE_COLORS[item.type]
            return (
              <div
                key={item.id}
                onClick={() => setEditModalItem({ item: item.item, itemType: 'schedule' })}
                className={`rounded-2xl border-l-4 bg-white p-3.5 shadow-xs cursor-pointer hover:shadow-md transition-all ${typeUi.border}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${typeUi.badge}`}
                  >
                    {ITEM_TYPE_EMOJI[item.type]} {ITEM_TYPE_LABEL[item.type]}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Clock size={11} /> {to12h(item.startMin)} ({fmtDur(item.durationMin)})
                  </span>
                </div>
                <h4 className="mt-1.5 text-sm font-bold text-slate-900">{item.title}</h4>
                {item.location && (
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin size={11} /> {item.location}
                  </p>
                )}
              </div>
            )
          })}

          {/* Tasks scheduled for this day on mobile */}
          {activeMobileDayData.tasks.map((t) => {
            const prio = PRIORITY_COLORS[t.priority]
            const isDone = t.status === 'done'
            return (
              <div
                key={t.id}
                onClick={() => setEditModalItem({ item: t, itemType: 'task' })}
                className={`rounded-2xl border-l-4 bg-white p-3.5 shadow-xs cursor-pointer hover:shadow-md transition-all ${
                  isDone
                    ? 'border-l-slate-300 opacity-60 bg-slate-50'
                    : 'border-l-emerald-500 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold uppercase">
                    📋 Task
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${prio.badge}`}
                  >
                    {t.priority}
                  </span>
                </div>
                <h4
                  className={`mt-1.5 text-sm font-bold ${
                    isDone ? 'line-through text-slate-400' : 'text-slate-900'
                  }`}
                >
                  {t.title}
                </h4>
                {t.estimate && (
                  <span className="text-xs text-slate-500 mt-1 inline-flex items-center gap-1">
                    <Clock size={11} /> {fmtDur(t.estimate)} planned
                  </span>
                )}
              </div>
            )
          })}

          {activeMobileDayData.layout.placed.length === 0 &&
            activeMobileDayData.tasks.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-400 rounded-2xl border-2 border-dashed border-slate-200 bg-white">
                No items scheduled for this day
              </div>
            )}
        </div>
      </div>

      {/* DESKTOP 7-DAY GRID (Cleanly fitted across 7 days) */}
      <div className="hidden md:flex flex-1 p-5 min-h-0 overflow-auto">
        <div className="grid w-full grid-cols-7 gap-3.5 min-h-[32rem]">
          {weekLayouts.map(({ date, layout, tasks: dayTasks }) => {
            const isCurrentDay = date === today
            const isSelected = date === activeDate
            const dateObj = new Date(date + 'T12:00:00')
            const dowName = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
            const dayNum = dateObj.getDate()

            return (
              <div
                key={date}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropOnDay(date, e)}
                className={`flex flex-col rounded-3xl border bg-white shadow-xs transition-all ${
                  isCurrentDay
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-500/10'
                    : isSelected
                    ? 'border-slate-300'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Day Header */}
                <div
                  onClick={() => {
                    setDate(date)
                    setView('today')
                  }}
                  className={`cursor-pointer border-b p-3 transition-colors rounded-t-3xl ${
                    isCurrentDay
                      ? 'bg-emerald-50/70 border-emerald-100'
                      : 'bg-slate-50/70 border-slate-100 hover:bg-slate-100/70'
                  }`}
                  title="Click to view in Today Timeline"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black uppercase tracking-wider ${
                        isCurrentDay ? 'text-emerald-900' : 'text-slate-600'
                      }`}
                    >
                      {dowName}
                    </span>
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                        isCurrentDay
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      {dayNum}
                    </span>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">Load:</span>
                      <span
                        className={`font-bold ${
                          layout.isOverloaded
                            ? 'text-rose-600'
                            : layout.capacityPct > 80
                            ? 'text-amber-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        {layout.capacityPct}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                      <div
                        className={`h-full rounded-full transition-all ${
                          layout.isOverloaded
                            ? 'bg-rose-500'
                            : layout.capacityPct > 80
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, layout.capacityPct)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Day Items List (Classes, Meetings, Routines, Reading, Tasks) */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {layout.placed.map((item) => {
                    const typeUi = ITEM_TYPE_COLORS[item.type]
                    return (
                      <div
                        key={item.id}
                        onClick={() => setEditModalItem({ item: item.item, itemType: 'schedule' })}
                        className={`rounded-xl border-l-3 p-2.5 text-xs shadow-2xs cursor-pointer hover:shadow-sm hover:scale-[1.01] transition-all ${typeUi.border} ${typeUi.bg}`}
                        title="Click to view & edit details"
                      >
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 mb-0.5">
                          <span>{ITEM_TYPE_EMOJI[item.type]}</span>
                          <span className="uppercase">{ITEM_TYPE_LABEL[item.type]}</span>
                        </div>
                        <div className="font-bold text-slate-900 truncate">{item.title}</div>
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                          <Clock size={10} />
                          {to12h(item.startMin)} ({fmtDur(item.durationMin)})
                        </div>
                      </div>
                    )
                  })}

                  {/* Planned Tasks section (Appearing just like the rest!) */}
                  {dayTasks.map((t) => {
                    const isDone = t.status === 'done'
                    return (
                      <div
                        key={t.id}
                        onClick={() => setEditModalItem({ item: t, itemType: 'task' })}
                        className={`rounded-xl border-l-3 border-l-emerald-500 bg-emerald-50/50 p-2.5 text-xs shadow-2xs cursor-pointer hover:shadow-sm hover:scale-[1.01] transition-all ${
                          isDone ? 'opacity-60 line-through bg-slate-50 border-l-slate-300' : ''
                        }`}
                        title="Click to view & edit task"
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 mb-0.5">
                          <span>📋 TASK</span>
                          <span className="uppercase font-semibold text-slate-500">{t.priority}</span>
                        </div>
                        <div className="font-bold text-slate-900 truncate">{t.title}</div>
                        {t.estimate && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                            <Clock size={10} />
                            {fmtDur(t.estimate)} planned
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {layout.placed.length === 0 && dayTasks.length === 0 && (
                    <div className="py-10 text-center text-[11px] text-slate-300">
                      No commitments
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
