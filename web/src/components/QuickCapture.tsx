import { useEffect, useRef, useState } from 'react'
import { Zap, X, Clock, Tag, AlertCircle, ChevronDown, ChevronUp, Calendar, LayoutGrid, FileText } from 'lucide-react'
import { useStore } from '../store'
import { parseShortSyntax } from '../lib/parse'
import { fmtDur, todayISO, addDaysISO } from '../lib/time'
import type { TaskPriority } from '../lib/types'

export function QuickCapture() {
  const captureOpen = useStore((s) => s.captureOpen)
  const setCapture = useStore((s) => s.setCapture)
  const addTask = useStore((s) => s.addTask)
  const boardColumns = useStore((s) => s.boardColumns)
  const activeDate = useStore((s) => s.date)

  const [input, setInput] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [notes, setNotes] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [estimate, setEstimate] = useState<number | undefined>(30)
  const [columnId, setColumnId] = useState(boardColumns[0]?.id || 'backlog')
  const [scheduledDate, setScheduledDate] = useState<string | undefined>(undefined)

  const inputRef = useRef<HTMLInputElement>(null)

  const PLACEHOLDERS = [
    'e.g. Finish database migration 1h #dev !high',
    'e.g. Submit lab report 45m !high',
    'e.g. Review lecture notes 30m #study',
    'e.g. Clean up git branches 15m !low',
  ]
  const [placeholderIdx, setPlaceholderIdx] = useState(0)

  useEffect(() => {
    if (captureOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length)
    } else {
      setInput('')
      setNotes('')
      setShowDetails(false)
      setScheduledDate(undefined)
    }
  }, [captureOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && captureOpen) {
        setCapture(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [captureOpen, setCapture])

  if (!captureOpen) return null

  const parsed = parseShortSyntax(input)

  // When parsing short syntax, synchronize priority/estimate if not manually modified
  const activePriority = showDetails ? priority : parsed.priority
  const activeEstimate = showDetails ? estimate : parsed.estimate || estimate

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    addTask({
      title: parsed.title,
      notes: notes.trim() || undefined,
      estimate: activeEstimate,
      priority: activePriority,
      status: columnId === 'done' ? 'done' : 'todo',
      columnId: columnId,
      scheduledDate: scheduledDate,
      fromCapture: true,
    })

    setInput('')
    setNotes('')
    setCapture(false)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-capture-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      onClick={() => setCapture(false)}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-slate-300 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Zap size={16} className="fill-amber-500 text-amber-500" />
            </span>
            <span id="quick-capture-title">Quick Capture Task</span>
          </div>
          <button
            onClick={() => setCapture(false)}
            aria-label="Close quick capture"
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {/* Main Title Input */}
          <div>
            <input
              ref={inputRef}
              type="text"
              required
              aria-label="Task title with optional short syntax"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={PLACEHOLDERS[placeholderIdx]}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
            />
          </div>

          {/* Live parse preview */}
          {input.trim().length > 0 && !showDetails && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-emerald-50/70 p-2.5 text-xs text-slate-700 border border-emerald-100">
              <span className="font-bold text-emerald-950">Captured:</span>
              <span className="font-medium text-slate-800">{parsed.title}</span>

              {parsed.estimate && (
                <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 font-bold text-emerald-800 border border-emerald-200">
                  <Clock size={11} /> {fmtDur(parsed.estimate)}
                </span>
              )}

              {parsed.categoryName && (
                <span className="inline-flex items-center gap-1 rounded-md bg-teal-100/70 px-2 py-0.5 font-bold text-teal-900 border border-teal-200">
                  <Tag size={11} /> #{parsed.categoryName}
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-bold ${
                  parsed.priority === 'high'
                    ? 'bg-rose-100 text-rose-800'
                    : parsed.priority === 'low'
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                <AlertCircle size={11} /> {parsed.priority}
              </span>
            </div>
          )}

          {/* Toggle Detailed Options */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors pt-1"
          >
            {showDetails ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            {showDetails ? 'Hide Detailed Options' : '+ More Details (Notes, Column, Date, Priority)'}
          </button>

          {/* Detailed Drawer */}
          {showDetails && (
            <div className="space-y-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              {/* Notes */}
              <div>
                <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  <FileText size={12} /> Notes / Details
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any extra steps or context..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-800 bg-white"
                />
              </div>

              {/* Priority & Column */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 bg-white"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority (!high)</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    <LayoutGrid size={12} /> Board Column
                  </label>
                  <select
                    value={columnId}
                    onChange={(e) => setColumnId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 bg-white"
                  >
                    {boardColumns.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Estimate & Schedule Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    <Clock size={12} /> Estimate
                  </label>
                  <select
                    value={estimate || 30}
                    onChange={(e) => setEstimate(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 bg-white"
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    <Calendar size={12} /> Schedule Date
                  </label>
                  <select
                    value={scheduledDate || ''}
                    onChange={(e) => setScheduledDate(e.target.value || undefined)}
                    className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 bg-white"
                  >
                    <option value="">Unscheduled (Inbox)</option>
                    <option value={todayISO()}>Today ({todayISO()})</option>
                    <option value={addDaysISO(todayISO(), 1)}>Tomorrow</option>
                    {activeDate !== todayISO() && (
                      <option value={activeDate}>Viewing Date ({activeDate})</option>
                    )}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Syntax helper footer */}
          {!showDetails && (
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>
                Tip: Type <code className="font-mono text-emerald-700">1h</code> time ·{' '}
                <code className="font-mono text-emerald-700">!high</code> priority ·{' '}
                <code className="font-mono text-emerald-700">#tag</code>
              </span>
              <span className="font-semibold text-slate-500">Press ↵</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCapture(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-colors"
            >
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
