import { Play, Square, Check, ArrowRight, Coffee, Flame } from 'lucide-react'
import type { Placed } from '../lib/schedule'
import { useStore } from '../store'
import { EnergyChip } from './EnergyChip'
import { to12h, fmtDur } from '../lib/time'
import { ENERGY_UI } from '../lib/colors'

function fmtClock(totalSec: number): string {
  const neg = totalSec < 0
  const s = Math.abs(Math.round(totalSec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const mm = String(h > 0 ? m : m).padStart(2, '0')
  const ss = String(sec).padStart(2, '0')
  return `${neg ? '+' : ''}${h > 0 ? h + ':' : ''}${mm}:${ss}`
}

export function NowHud({
  current,
  next,
  curMin,
  now,
}: {
  current?: Placed
  next?: Placed
  curMin: number
  now: number
}) {
  const session = useStore((s) => s.session)
  const tasks = useStore((s) => s.tasks)
  const startSession = useStore((s) => s.startSession)
  const stopSession = useStore((s) => s.stopSession)
  const setBlockStatus = useStore((s) => s.setBlockStatus)
  const toggleTask = useStore((s) => s.toggleTask)

  const activeBlockId = session?.blockId ?? current?.block.id
  const sessionTasks = tasks
    .filter((t) => t.blockId === activeBlockId && t.status !== 'done')
    .slice(0, 3)

  // ----- Active focus session -----
  if (session) {
    const block = useStore.getState().blocks.find((b) => b.id === session.blockId)
    const remainingSec = session.plannedMin * 60 - (now - session.startedAt) / 1000
    const over = remainingSec < 0
    const ui = ENERGY_UI[block?.energy ?? 'alpha']
    const pct = Math.max(
      0,
      Math.min(100, ((now - session.startedAt) / 1000 / (session.plannedMin * 60)) * 100),
    )
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-white shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
          <Flame size={14} className="text-violet-400" /> Engaged
        </div>
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold">{block?.title ?? 'Focus'}</h2>
          <div className={`font-mono text-4xl tabular-nums ${over ? 'text-rose-400' : 'text-white'}`}>
            {fmtClock(remainingSec)}
          </div>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
          <div className={`h-full ${over ? 'bg-rose-500' : ui.dot}`} style={{ width: `${pct}%` }} />
        </div>
        {over && (
          <div className="mt-2 text-xs text-rose-300">
            Over your planned {fmtDur(session.plannedMin)} — wrap up or rebalance the rest of the day.
          </div>
        )}

        {sessionTasks.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {sessionTasks.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => toggleTask(t.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-sm text-slate-200 hover:bg-slate-800"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded border border-slate-500" />
                  {t.title}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              if (block) setBlockStatus(block.id, 'done')
              stopSession()
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-400"
          >
            <Check size={15} /> Done
          </button>
          <button
            onClick={stopSession}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-medium text-slate-100 hover:bg-slate-600"
          >
            <Square size={14} /> Stop
          </button>
        </div>
      </div>
    )
  }

  // ----- Not engaged: show now + next -----
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Right now</div>
      {current ? (
        <div className="mt-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-900">{current.block.title}</h2>
            <EnergyChip energy={current.block.energy} />
          </div>
          <div className="mt-0.5 text-sm text-slate-500">
            {to12h(current.startMin)} – {to12h(current.endMin)} · {fmtDur(current.block.durationMin)}
            {current.endMin > curMin && <> · {fmtDur(current.endMin - curMin)} left</>}
          </div>
          <button
            onClick={() => startSession(current.block.id)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            <Play size={15} /> Engage
          </button>
        </div>
      ) : (
        <div className="mt-1 flex items-center gap-2 text-slate-500">
          <Coffee size={18} /> <span className="text-base">Open time — nothing scheduled.</span>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-sm">
        <ArrowRight size={15} className="text-slate-400" />
        {next ? (
          <span className="text-slate-600">
            <span className="font-medium text-slate-800">{next.block.title}</span> at{' '}
            {to12h(next.startMin)}
            {next.startMin > curMin && (
              <span className="text-slate-400"> · in {fmtDur(next.startMin - curMin)}</span>
            )}
          </span>
        ) : (
          <span className="text-slate-400">Nothing else scheduled today.</span>
        )}
      </div>
    </div>
  )
}
