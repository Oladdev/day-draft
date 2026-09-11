import { Play, Check, Trash2, Lock, Waves } from 'lucide-react'
import type { DayLayout, Placed } from '../lib/schedule'
import type { Settings, Block } from '../lib/types'
import { useStore } from '../store'
import { to12h, fmtDur } from '../lib/time'
import { ENERGY_UI } from '../lib/colors'

const PPM = 0.8 // pixels per minute

export function Timeline({
  layout,
  settings,
  curMin,
  isToday,
}: {
  layout: DayLayout
  settings: Settings
  curMin: number
  isToday: boolean
}) {
  const height = (settings.dayEndMin - settings.dayStartMin) * PPM
  const hours: number[] = []
  for (let m = settings.dayStartMin; m <= settings.dayEndMin; m += 60) hours.push(m)

  const conflictIds = new Set<string>()
  layout.conflicts.forEach(([a, b]) => {
    conflictIds.add(a.id)
    conflictIds.add(b.id)
  })

  const tasks = useStore((s) => s.tasks)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="relative" style={{ height }}>
        {/* hour gridlines + labels */}
        {hours.map((m) => (
          <div
            key={m}
            className="absolute left-0 right-0 flex items-start"
            style={{ top: (m - settings.dayStartMin) * PPM }}
          >
            <span className="-mt-2 w-12 pr-2 text-right text-[11px] tabular-nums text-slate-400">
              {to12h(m)}
            </span>
            <div className="mt-[1px] flex-1 border-t border-slate-100" />
          </div>
        ))}

        {/* free gaps (protected free time, pillar 5) */}
        {layout.gaps
          .filter((g) => g.end - g.start >= 30)
          .map((g, i) => (
            <div
              key={`gap-${i}`}
              className="absolute right-2 flex items-center justify-center rounded-lg border border-dashed border-slate-200 text-[11px] font-medium text-slate-300"
              style={{
                left: 56,
                top: (g.start - settings.dayStartMin) * PPM + 2,
                height: (g.end - g.start) * PPM - 4,
              }}
            >
              Free · {fmtDur(g.end - g.start)}
            </div>
          ))}

        {/* blocks */}
        {layout.placed.map((p) => (
          <BlockCard
            key={p.block.id}
            placed={p}
            dayStart={settings.dayStartMin}
            conflict={conflictIds.has(p.block.id)}
            taskCount={tasks.filter((t) => t.blockId === p.block.id && t.status !== 'done').length}
          />
        ))}

        {/* now line */}
        {isToday && curMin >= settings.dayStartMin && curMin <= settings.dayEndMin && (
          <div
            className="pointer-events-none absolute left-12 right-0 z-20 flex items-center"
            style={{ top: (curMin - settings.dayStartMin) * PPM }}
          >
            <div className="h-2 w-2 rounded-full bg-rose-500" />
            <div className="h-[2px] flex-1 bg-rose-500" />
          </div>
        )}
      </div>

      {/* overflow — routines that didn't fit */}
      {layout.overflow.length > 0 && (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
          <div className="text-xs font-semibold text-rose-700">
            {layout.overflow.length} routine block{layout.overflow.length > 1 ? 's' : ''} didn’t fit —
            shorten something, or push to tomorrow.
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {layout.overflow.map((b) => (
              <span
                key={b.id}
                className="rounded-md border border-rose-200 bg-white px-2 py-0.5 text-xs text-rose-700"
              >
                {b.title} · {fmtDur(b.durationMin)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function BlockCard({
  placed,
  dayStart,
  conflict,
  taskCount,
}: {
  placed: Placed
  dayStart: number
  conflict: boolean
  taskCount: number
}) {
  const { block, startMin, endMin } = placed
  const startSession = useStore((s) => s.startSession)
  const setBlockStatus = useStore((s) => s.setBlockStatus)
  const removeBlock = useStore((s) => s.removeBlock)
  const cycleBlockEnergy = useStore((s) => s.cycleBlockEnergy)

  const ui = ENERGY_UI[block.energy]
  const h = Math.max(block.durationMin * PPM, 26)
  const tall = h >= 52
  const done = block.status === 'done'
  const isAnchor = block.kind === 'anchor'

  return (
    <div
      className={`group absolute overflow-hidden rounded-lg border border-l-4 bg-white shadow-sm ${
        ui.accent
      } ${conflict ? 'ring-2 ring-rose-400' : 'border-slate-200'} ${done ? 'opacity-50' : ''}`}
      style={{ left: 56, right: 8, top: (startMin - dayStart) * PPM, height: h }}
    >
      <div className="flex h-full items-start justify-between gap-1 px-2 py-1">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => cycleBlockEnergy(block.id)}
              title="Downshift energy"
              className={`h-2 w-2 shrink-0 rounded-full ${ui.dot}`}
            />
            <span
              className={`truncate text-sm font-medium text-slate-800 ${done ? 'line-through' : ''}`}
            >
              {block.title}
            </span>
          </div>
          {tall && (
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-0.5">
                {isAnchor ? <Lock size={10} /> : <Waves size={10} />}
                {isAnchor ? 'Fixed' : 'Fluid'}
              </span>
              <span>·</span>
              <span className="tabular-nums">
                {to12h(startMin)}–{to12h(endMin)}
              </span>
              {taskCount > 0 && (
                <>
                  <span>·</span>
                  <span>{taskCount} task{taskCount > 1 ? 's' : ''}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* hover actions */}
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          {!done && (
            <button
              onClick={() => startSession(block.id)}
              title="Engage"
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <Play size={13} />
            </button>
          )}
          <button
            onClick={() => setBlockStatus(block.id, done ? 'planned' : 'done')}
            title={done ? 'Mark not done' : 'Mark done'}
            className="rounded p-1 text-slate-400 hover:bg-emerald-100 hover:text-emerald-700"
          >
            <Check size={13} />
          </button>
          <button
            onClick={() => removeBlock(block.id)}
            title="Delete"
            className="rounded p-1 text-slate-400 hover:bg-rose-100 hover:text-rose-700"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
