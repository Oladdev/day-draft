import { useState, useEffect } from 'react'
import { Flame, Square, CheckCircle, Clock } from 'lucide-react'
import { useStore } from '../store'
import { fmtTimer } from '../lib/time'

export function FocusHUD() {
  const focusSession = useStore((s) => s.focusSession)
  const stopFocus = useStore((s) => s.stopFocus)
  const toggleTask = useStore((s) => s.toggleTask)

  // Live timer tick
  const [elapsedSec, setElapsedSec] = useState(0)

  useEffect(() => {
    if (!focusSession) {
      setElapsedSec(0)
      return
    }

    const interval = setInterval(() => {
      const now = Date.now()
      const diff = Math.floor((now - focusSession.startedAt) / 1000)
      setElapsedSec(diff)
    }, 1000)

    return () => clearInterval(interval)
  }, [focusSession])

  if (!focusSession) return null

  const totalPlannedSec = focusSession.plannedMin * 60
  const remainingSec = totalPlannedSec - elapsedSec
  const isOvertime = remainingSec < 0
  const progressPct = Math.min(100, Math.max(0, (elapsedSec / totalPlannedSec) * 100))

  const handleComplete = () => {
    if (focusSession.targetType === 'task') {
      toggleTask(focusSession.targetId)
    }
    stopFocus()
  }

  return (
    <div className="rounded-2xl border border-emerald-900/60 bg-emerald-950 p-5 text-white shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <Flame size={16} className="text-emerald-400 animate-pulse" />
          Active Focus Session
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-300/80">
          <Clock size={13} />
          {focusSession.plannedMin}m planned
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">{focusSession.targetTitle}</h2>
          <p className="text-xs text-emerald-300/80 mt-0.5">
            {focusSession.targetType === 'item' ? 'Scheduled Block' : 'Priority Task'}
          </p>
        </div>

        {/* Large Countdown display */}
        <div className="flex items-baseline gap-2">
          <span
            className={`font-mono text-3xl font-black tracking-tight ${
              isOvertime ? 'text-amber-300' : 'text-emerald-100'
            }`}
          >
            {fmtTimer(remainingSec)}
          </span>
          {isOvertime && <span className="text-xs font-semibold text-amber-300">(Overtime)</span>}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-emerald-900/80">
        <div
          className={`h-full transition-all duration-500 ${
            isOvertime ? 'bg-amber-400' : 'bg-emerald-400'
          }`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Control Buttons */}
      <div className="mt-4 flex items-center justify-end gap-2.5">
        <button
          onClick={stopFocus}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-900/80 px-3.5 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-800 transition-colors"
        >
          <Square size={13} /> Cancel
        </button>

        <button
          onClick={handleComplete}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition-all"
        >
          <CheckCircle size={14} /> Mark Complete
        </button>
      </div>
    </div>
  )
}
