import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  LayoutTemplate,
  Zap,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import type { DayLayout } from '../lib/schedule'
import { useStore } from '../store'
import { addDaysISO, fmtDur, prettyDate, todayISO } from '../lib/time'

export function TopBar({ layout, onAddBlock }: { layout: DayLayout; onAddBlock: () => void }) {
  const date = useStore((s) => s.date)
  const setDate = useStore((s) => s.setDate)
  const settings = useStore((s) => s.settings)
  const templates = useStore((s) => s.templates)
  const applyTemplate = useStore((s) => s.applyTemplate)
  const clearDay = useStore((s) => s.clearDay)
  const setCapture = useStore((s) => s.setCapture)

  const [tplOpen, setTplOpen] = useState(false)
  const isToday = date === todayISO()

  const overcommitted = layout.overflow.length > 0 || layout.freeMin < 30
  const freeColor = overcommitted
    ? 'text-rose-600'
    : layout.freeMin < settings.targetFreeMin
      ? 'text-amber-600'
      : 'text-emerald-600'

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-sm font-bold text-white">
            D
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">Day Draft</div>
            <div className="text-[11px] text-slate-400">Second brain scheduler</div>
          </div>
        </div>

        {/* date nav */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDate(addDaysISO(date, -1))}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setDate(todayISO())}
            className={`min-w-[9.5rem] rounded-lg px-2 py-1 text-center text-sm font-medium ${
              isToday ? 'text-slate-900' : 'text-slate-600 hover:bg-slate-200'
            }`}
            title="Jump to today"
          >
            {isToday ? 'Today' : prettyDate(date)}
            <div className="text-[11px] font-normal text-slate-400">{isToday && prettyDate(date)}</div>
          </button>
          <button
            onClick={() => setDate(addDaysISO(date, 1))}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* stats */}
        <div className="flex items-center gap-3 text-xs">
          <Stat label="Committed" value={fmtDur(layout.committedMin)} className="text-slate-700" />
          <Stat label="Free" value={fmtDur(layout.freeMin)} className={freeColor} />
          {layout.conflicts.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-1 font-medium text-rose-700">
              <AlertTriangle size={12} /> {layout.conflicts.length} conflict
              {layout.conflicts.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* actions */}
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setTplOpen((o) => !o)}
              onBlur={() => setTimeout(() => setTplOpen(false), 150)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              <LayoutTemplate size={15} /> Template
            </button>
            {tplOpen && (
              <div className="absolute right-0 z-40 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onMouseDown={() => {
                      applyTemplate(t.id)
                      setTplOpen(false)
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left hover:bg-slate-50"
                  >
                    <div className="text-sm font-medium text-slate-800">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setCapture(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            title="Quick capture (C)"
          >
            <Zap size={15} /> Capture
          </button>

          <button
            onClick={onAddBlock}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            <Plus size={15} /> Block
          </button>

          <button
            onClick={() => {
              if (confirm('Clear all blocks for this day?')) clearDay()
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-100 hover:text-rose-600"
            title="Clear this day"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="text-slate-400">{label}</span>
      <span className={`font-semibold tabular-nums ${className ?? ''}`}>{value}</span>
    </span>
  )
}
