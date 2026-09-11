import { useState } from 'react'
import { Check, Trash2, Plus, Layers, Inbox } from 'lucide-react'
import { useStore } from '../store'
import { EnergyChip } from './EnergyChip'
import { PRIORITY_UI } from '../lib/colors'
import { fmtDur, to12h } from '../lib/time'
import { PHASE_LABEL } from '../lib/types'

export function Backlog() {
  const tasks = useStore((s) => s.tasks)
  const blocks = useStore((s) => s.blocks)
  const date = useStore((s) => s.date)
  const addTask = useStore((s) => s.addTask)
  const toggleTask = useStore((s) => s.toggleTask)
  const removeTask = useStore((s) => s.removeTask)
  const assignTask = useStore((s) => s.assignTask)
  const cycleTaskEnergy = useStore((s) => s.cycleTaskEnergy)
  const createAdminSweep = useStore((s) => s.createAdminSweep)

  const [title, setTitle] = useState('')

  const inbox = tasks.filter((t) => !t.blockId && t.status === 'todo')
  const doneCount = tasks.filter((t) => t.status === 'done').length
  const adminInbox = inbox.filter((t) => t.energy === 'admin')
  const dayBlocks = blocks
    .filter((b) => b.date === date)
    .sort((a, b) => (a.startMin ?? 9999) - (b.startMin ?? 9999) || a.order - b.order)

  const submit = () => {
    if (!title.trim()) return
    addTask({ title: title.trim() })
    setTitle('')
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Inbox size={16} className="text-slate-400" />
          Backlog
          <span className="rounded-full bg-slate-100 px-1.5 text-xs font-normal text-slate-500">
            {inbox.length}
          </span>
        </div>
        {adminInbox.length > 0 && (
          <button
            onClick={createAdminSweep}
            title="Cluster admin tasks into a 30-min sweep block"
            className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
          >
            <Layers size={13} /> Admin Sweep ({adminInbox.length})
          </button>
        )}
      </div>

      <div className="border-b border-slate-100 p-3">
        <div className="flex items-center gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Add a task…"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-slate-400"
          />
          <button
            onClick={submit}
            className="rounded-lg bg-slate-900 p-2 text-white hover:bg-slate-700"
            aria-label="Add task"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {inbox.length === 0 ? (
          <div className="px-2 py-8 text-center text-sm text-slate-400">
            Inbox zero. Nice.
            <div className="mt-1 text-xs">
              Press <kbd className="rounded border border-slate-300 bg-slate-50 px-1">C</kbd> to
              quick-capture a thought.
            </div>
          </div>
        ) : (
          <ul className="space-y-1">
            {inbox.map((t) => (
              <li
                key={t.id}
                className="group rounded-lg border border-transparent px-2 py-1.5 hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="flex items-start gap-2">
                  <button
                    onClick={() => toggleTask(t.id)}
                    className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-300 hover:border-emerald-500 hover:text-emerald-600"
                    title="Complete"
                  >
                    <Check size={11} className="opacity-0 group-hover:opacity-60" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm text-slate-800">{t.title}</span>
                      {t.priority === 'high' && (
                        <span className={`text-xs font-bold ${PRIORITY_UI.high}`}>!</span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <EnergyChip energy={t.energy} size="xs" onClick={() => cycleTaskEnergy(t.id)} />
                      {t.estimateMin != null && (
                        <span className="text-[11px] text-slate-400">~{fmtDur(t.estimateMin)}</span>
                      )}
                      <select
                        value=""
                        onChange={(e) => e.target.value && assignTask(t.id, e.target.value)}
                        className="ml-auto rounded border border-slate-200 bg-white px-1 py-0.5 text-[11px] text-slate-500 outline-none hover:border-slate-300"
                        title="Nest into a block"
                      >
                        <option value="">Schedule into…</option>
                        {dayBlocks.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.title}
                            {b.startMin != null
                              ? ` · ${to12h(b.startMin)}`
                              : b.phase
                                ? ` · ${PHASE_LABEL[b.phase]}`
                                : ''}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeTask(t.id)}
                        className="rounded p-0.5 text-slate-300 opacity-0 hover:bg-rose-100 hover:text-rose-600 group-hover:opacity-100"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {doneCount > 0 && (
        <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400">
          {doneCount} completed
        </div>
      )}
    </div>
  )
}
