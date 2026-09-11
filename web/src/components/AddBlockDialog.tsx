import { useState, type ReactNode } from 'react'
import { Lock, Waves } from 'lucide-react'
import { useStore } from '../store'
import { Modal } from './Modal'
import type { BlockKind, DayPhase, Energy } from '../lib/types'
import { ENERGY_LABEL, PHASE_LABEL } from '../lib/types'
import { parseHHMM } from '../lib/time'
import { ENERGY_UI } from '../lib/colors'

const ENERGIES: Energy[] = ['alpha', 'medium', 'admin']
const PHASE_OPTS: DayPhase[] = ['morning', 'afternoon', 'night']

export function AddBlockDialog({ onClose }: { onClose: () => void }) {
  const addBlock = useStore((s) => s.addBlock)
  const categories = useStore((s) => s.categories)

  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<BlockKind>('routine')
  const [energy, setEnergy] = useState<Energy>('alpha')
  const [categoryId, setCategoryId] = useState<string>('cat-coding')
  const [start, setStart] = useState('09:00')
  const [phase, setPhase] = useState<DayPhase>('morning')
  const [duration, setDuration] = useState(60)

  const save = () => {
    if (!title.trim()) return
    addBlock({
      title: title.trim(),
      kind,
      energy,
      categoryId,
      durationMin: duration,
      ...(kind === 'anchor' ? { startMin: parseHHMM(start) } : { phase }),
    })
    onClose()
  }

  const KindBtn = ({ k, icon, label, hint }: { k: BlockKind; icon: ReactNode; label: string; hint: string }) => (
    <button
      onClick={() => setKind(k)}
      className={`flex-1 rounded-xl border p-3 text-left transition ${
        kind === k ? 'border-slate-800 bg-slate-50 ring-1 ring-slate-800' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-xs text-slate-400">{hint}</div>
    </button>
  )

  return (
    <Modal title="Add a block" onClose={onClose} wide>
      <div className="space-y-4">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          placeholder="What is it? e.g. Data Structures lecture"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
        />

        <div className="flex gap-2">
          <KindBtn k="anchor" icon={<Lock size={14} />} label="Fixed anchor" hint="Hard time — won't move" />
          <KindBtn k="routine" icon={<Waves size={14} />} label="Fluid routine" hint="Slides within a phase" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {kind === 'anchor' ? (
            <label className="text-xs font-medium text-slate-500">
              Start time
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-slate-400"
              />
            </label>
          ) : (
            <label className="text-xs font-medium text-slate-500">
              Phase of day
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value as DayPhase)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-slate-400"
              >
                {PHASE_OPTS.map((p) => (
                  <option key={p} value={p}>
                    {PHASE_LABEL[p]}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="text-xs font-medium text-slate-500">
            Duration
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-slate-400"
            >
              {[15, 30, 45, 60, 90, 120, 180].map((d) => (
                <option key={d} value={d}>
                  {d >= 60 ? `${d / 60}h${d % 60 ? ` ${d % 60}m` : ''}` : `${d}m`}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">Energy</div>
          <div className="flex gap-2">
            {ENERGIES.map((e) => {
              const ui = ENERGY_UI[e]
              return (
                <button
                  key={e}
                  onClick={() => setEnergy(e)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                    energy === e ? `${ui.chip} ring-1 ${ui.ring}` : 'border-slate-200 text-slate-500'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${ui.dot}`} />
                  {ENERGY_LABEL[e]}
                </button>
              )
            })}
          </div>
        </div>

        <label className="block text-xs font-medium text-slate-500">
          Category
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-slate-400"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            Add block
          </button>
        </div>
      </div>
    </Modal>
  )
}
