import { useState, useEffect } from 'react'
import {
  X,
  Trash2,
  Check,
  Flame,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
} from 'lucide-react'
import { useStore } from '../store'
import type { ScheduleItem, Task, TaskPriority } from '../lib/types'
import { ITEM_TYPE_LABEL, ITEM_TYPE_EMOJI } from '../lib/types'
import { toHHMM, fmtDur, todayISO } from '../lib/time'

export function EditItemModal() {
  const editModalItem = useStore((s) => s.editModalItem)
  const setEditModalItem = useStore((s) => s.setEditModalItem)
  const updateItem = useStore((s) => s.updateItem)
  const removeItem = useStore((s) => s.removeItem)
  const updateTask = useStore((s) => s.updateTask)
  const removeTask = useStore((s) => s.removeTask)
  const toggleTask = useStore((s) => s.toggleTask)
  const startFocus = useStore((s) => s.startFocus)
  const skipOccurrence = useStore((s) => s.skipOccurrence)
  const boardColumns = useStore((s) => s.boardColumns)
  const activeDate = useStore((s) => s.date)

  if (!editModalItem) return null

  const isTask = editModalItem.itemType === 'task'
  const task = isTask ? (editModalItem.item as Task) : null
  const scheduleItem = !isTask ? (editModalItem.item as ScheduleItem) : null

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditModalItem(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setEditModalItem])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      onClick={() => setEditModalItem(null)}
    >
      <div
        className="w-full sm:max-w-lg max-h-[92vh] sm:max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-slate-300 sm:hidden" />

        {isTask && task && <TaskEditor task={task} onClose={() => setEditModalItem(null)} />}
        {!isTask && scheduleItem && (
          <ScheduleItemEditor
            item={scheduleItem}
            activeDate={activeDate}
            onClose={() => setEditModalItem(null)}
          />
        )}
      </div>
    </div>
  )
}

function ScheduleItemEditor({
  item,
  activeDate,
  onClose,
}: {
  item: ScheduleItem
  activeDate: string
  onClose: () => void
}) {
  const updateItem = useStore((s) => s.updateItem)
  const removeItem = useStore((s) => s.removeItem)
  const skipOccurrence = useStore((s) => s.skipOccurrence)
  const startFocus = useStore((s) => s.startFocus)

  const [title, setTitle] = useState(item.title)
  const [startTime, setStartTime] = useState(item.startTime || '09:00')
  const [duration, setDuration] = useState(item.duration)
  const [location, setLocation] = useState(item.location || '')
  const [notes, setNotes] = useState(item.notes || '')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    updateItem(item.id, {
      title: title.trim(),
      startTime: item.startTime ? startTime : undefined,
      duration: Number(duration) || 60,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
    })
    onClose()
  }

  return (
    <div>
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xl">{ITEM_TYPE_EMOJI[item.type]}</span>
          <div>
            <h3 id="edit-modal-title" className="text-base font-bold text-slate-900">
              Edit {ITEM_TYPE_LABEL[item.type]}
            </h3>
            <p className="text-xs text-slate-400">Manage schedule details & timing</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close edit modal"
          className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSave} className="mt-4 space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 font-semibold focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {item.startTime && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 bg-white"
            >
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>1 hour</option>
              <option value={90}>1 hr 30 min</option>
              <option value={120}>2 hours</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Location / Video Link
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Room number or meeting link"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Notes / Syllabus Goals
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Key topics, chapters, reading goals..."
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
                  removeItem(item.id)
                  onClose()
                }
              }}
              className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors min-h-[44px]"
            >
              <Trash2 size={14} /> Delete
            </button>

            {item.recurrence && (
              <button
                type="button"
                onClick={() => {
                  skipOccurrence(item.id, activeDate)
                  onClose()
                }}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Skip This Occurrence
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                startFocus(item.id, 'item', item.title, duration)
                onClose()
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
            >
              <Flame size={14} className="text-emerald-600" /> Focus
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-sm"
            >
              <Check size={14} /> Save
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

function TaskEditor({ task, onClose }: { task: Task; onClose: () => void }) {
  const updateTask = useStore((s) => s.updateTask)
  const removeTask = useStore((s) => s.removeTask)
  const toggleTask = useStore((s) => s.toggleTask)
  const startFocus = useStore((s) => s.startFocus)
  const boardColumns = useStore((s) => s.boardColumns)

  const [title, setTitle] = useState(task.title)
  const [notes, setNotes] = useState(task.notes || '')
  const [priority, setPriority] = useState<TaskPriority>(task.priority)
  const [estimate, setEstimate] = useState(task.estimate || 30)
  const [columnId, setColumnId] = useState(task.columnId)
  const [scheduledDate, setScheduledDate] = useState(task.scheduledDate || '')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    updateTask(task.id, {
      title: title.trim(),
      notes: notes.trim() || undefined,
      priority,
      estimate: Number(estimate) || undefined,
      columnId,
      status: columnId === 'done' ? 'done' : task.status === 'done' ? 'todo' : task.status,
      scheduledDate: scheduledDate || undefined,
    })
    onClose()
  }

  return (
    <div>
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xl">📋</span>
          <div>
            <h3 className="text-base font-bold text-slate-900">Edit Task</h3>
            <p className="text-xs text-slate-400">Update task details, schedule, or priority</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSave} className="mt-4 space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Task Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 font-semibold focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Notes / Context
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Subtasks, requirements, references..."
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 bg-white"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Board Column
            </label>
            <select
              value={columnId}
              onChange={(e) => setColumnId(e.target.value)}
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Estimate (min)
            </label>
            <select
              value={estimate}
              onChange={(e) => setEstimate(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 bg-white"
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
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Plan For Date
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 bg-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
                removeTask(task.id)
                onClose()
              }
            }}
            className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 min-h-[44px]"
          >
            <Trash2 size={14} /> Delete Task
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                startFocus(task.id, 'task', task.title, estimate)
                onClose()
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 min-h-[44px]"
            >
              <Flame size={14} className="text-emerald-600" /> Focus
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-sm min-h-[44px]"
            >
              <Check size={14} /> Save Task
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
