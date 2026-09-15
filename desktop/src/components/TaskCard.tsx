import { useState } from 'react'
import { Check, Trash2, Clock, Calendar, Flame, MoreVertical, ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import type { Task } from '../lib/types'
import { PRIORITY_COLORS } from '../lib/colors'
import { fmtDur, prettyDate } from '../lib/time'
import { useStore } from '../store'

interface TaskCardProps {
  task: Task
  showScheduledDate?: boolean
  showColumnMover?: boolean
  onDragStart?: (e: React.DragEvent) => void
}

export function TaskCard({
  task,
  showScheduledDate = true,
  showColumnMover = true,
  onDragStart,
}: TaskCardProps) {
  const toggleTask = useStore((s) => s.toggleTask)
  const removeTask = useStore((s) => s.removeTask)
  const startFocus = useStore((s) => s.startFocus)
  const moveTaskToColumn = useStore((s) => s.moveTaskToColumn)
  const boardColumns = useStore((s) => s.boardColumns)
  const setEditModalItem = useStore((s) => s.setEditModalItem)

  const [menuOpen, setMenuOpen] = useState(false)
  const isDone = task.status === 'done'
  const priorityUi = PRIORITY_COLORS[task.priority]

  const currentColIdx = boardColumns.findIndex((c) => c.id === task.columnId)
  const prevCol = currentColIdx > 0 ? boardColumns[currentColIdx - 1] : null
  const nextCol = currentColIdx < boardColumns.length - 1 ? boardColumns[currentColIdx + 1] : null

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id)
    e.dataTransfer.setData('application/json', JSON.stringify({ id: task.id, fromCol: task.columnId }))
    e.dataTransfer.effectAllowed = 'move'
    if (onDragStart) onDragStart(e)
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => setEditModalItem({ item: task, itemType: 'task' })}
      className={`group relative rounded-2xl border bg-white p-3.5 shadow-xs transition-all duration-150 hover:shadow-md cursor-pointer select-none ${
        isDone ? 'border-slate-200 bg-slate-50/70 opacity-60' : 'border-slate-200 hover:border-emerald-300'
      }`}
      title="Click to view & edit task details"
    >
      <div className="flex items-start gap-2.5">
        {/* Toggle Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleTask(task.id)
          }}
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-colors ${
            isDone
              ? 'border-emerald-600 bg-emerald-600 text-white'
              : 'border-slate-300 hover:border-emerald-500 bg-white'
          }`}
          aria-label={isDone ? 'Mark as todo' : 'Mark as done'}
        >
          {isDone && <Check size={12} strokeWidth={3} />}
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold leading-snug break-words ${
              isDone ? 'line-through text-slate-400' : 'text-slate-900'
            }`}
          >
            {task.title}
          </p>

          {task.notes && (
            <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed flex items-start gap-1">
              <FileText size={11} className="shrink-0 mt-0.5 text-slate-400" />
              <span>{task.notes}</span>
            </p>
          )}

          {/* Badges / Metadata */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
            {/* Priority Indicator */}
            <span
              className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-bold text-[10px] uppercase tracking-wide ${priorityUi.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${priorityUi.dot}`} />
              {task.priority}
            </span>

            {/* Duration estimate */}
            {task.estimate && (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                <Clock size={11} className="text-slate-400" />
                {fmtDur(task.estimate)}
              </span>
            )}

            {/* Scheduled Date */}
            {showScheduledDate && task.scheduledDate && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                <Calendar size={11} className="text-emerald-600" />
                {prettyDate(task.scheduledDate)}
              </span>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="relative shrink-0 flex items-center gap-0.5">
          {!isDone && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                startFocus(task.id, 'task', task.title, task.estimate || 25)
              }}
              className="opacity-0 group-hover:opacity-100 sm:opacity-0 focus:opacity-100 rounded-lg p-1 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 transition-all"
              title="Start Focus Timer"
            >
              <Flame size={15} />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(!menuOpen)
            }}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            title="Options"
          >
            <MoreVertical size={14} />
          </button>

          {/* Quick Context Dropdown for Touch / Mobile */}
          {menuOpen && (
            <div
              className="absolute right-0 top-7 z-30 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Move Column
              </div>
              {boardColumns.map((col) => (
                <button
                  key={col.id}
                  onClick={() => {
                    moveTaskToColumn(task.id, col.id)
                    setMenuOpen(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-left font-medium transition-colors ${
                    task.columnId === col.id
                      ? 'bg-emerald-50 text-emerald-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {col.title}
                  {task.columnId === col.id && <Check size={13} className="text-emerald-600" />}
                </button>
              ))}

              <div className="my-1 border-t border-slate-100" />

              {!isDone && (
                <button
                  onClick={() => {
                    startFocus(task.id, 'task', task.title, task.estimate || 25)
                    setMenuOpen(false)
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-emerald-800 font-semibold hover:bg-emerald-50 transition-colors"
                >
                  <Flame size={14} className="text-emerald-600" /> Start Focus
                </button>
              )}

              <button
                onClick={() => {
                  removeTask(task.id)
                  setMenuOpen(false)
                }}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-rose-600 font-semibold hover:bg-rose-50 transition-colors"
              >
                <Trash2 size={13} /> Delete Task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tap-to-move quick actions: accessible on mobile & desktop */}
      {showColumnMover && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
          {prevCol ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                moveTaskToColumn(task.id, prevCol.id)
              }}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 font-medium transition-colors"
              title={`Move back to ${prevCol.title}`}
            >
              <ChevronLeft size={13} /> {prevCol.title}
            </button>
          ) : (
            <span />
          )}

          {nextCol && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                moveTaskToColumn(task.id, nextCol.id)
              }}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-emerald-700 hover:bg-emerald-50 font-bold transition-colors ml-auto"
              title={`Move forward to ${nextCol.title}`}
            >
              {nextCol.title} <ChevronRight size={13} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
