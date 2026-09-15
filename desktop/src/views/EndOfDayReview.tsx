import { useState, useEffect } from 'react'
import { Moon, CheckCircle, ArrowRight, Check, X } from 'lucide-react'
import { useStore } from '../store'
import { todayISO, addDaysISO } from '../lib/time'

export function EndOfDayReview() {
  const endOfDayOpen = useStore((s) => s.endOfDayOpen)
  const setEndOfDay = useStore((s) => s.setEndOfDay)
  const tasks = useStore((s) => s.tasks)
  const activeDate = useStore((s) => s.date)
  const planTask = useStore((s) => s.planTask)
  const toggleTask = useStore((s) => s.toggleTask)

  const [step, setStep] = useState<1 | 2>(1)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && endOfDayOpen) {
        setEndOfDay(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [endOfDayOpen, setEndOfDay])

  if (!endOfDayOpen) return null

  const tomorrow = addDaysISO(todayISO(), 1)
  const completedToday = tasks.filter((t) => t.status === 'done' && t.scheduledDate === activeDate)
  const unfinishedToday = tasks.filter((t) => t.status !== 'done' && t.scheduledDate === activeDate)

  const handlePushToTomorrow = (taskId: string) => {
    planTask(taskId, tomorrow)
  }

  const handleMoveToBacklog = (taskId: string) => {
    planTask(taskId, undefined)
  }

  const handleFinish = () => {
    setStep(1)
    setEndOfDay(false)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-review-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setEndOfDay(false)}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-slate-300 sm:hidden" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <Moon size={18} />
            </div>
            <div>
              <h3 id="day-review-title" className="text-base font-bold text-slate-900">End of Day Review</h3>
              <p className="text-xs text-slate-400">Clear your mind and prepare for tomorrow</p>
            </div>
          </div>
          <button
            onClick={() => setEndOfDay(false)}
            aria-label="Close review dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step 1: Celebrate Completed */}
        {step === 1 && (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-100 text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white mb-2 shadow-xs">
                <CheckCircle size={20} />
              </div>
              <h4 className="text-base font-bold text-emerald-950">
                You completed {completedToday.length} task{completedToday.length !== 1 ? 's' : ''} today!
              </h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Every bit of deep work and routine consistency counts.
              </p>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5">
              {completedToday.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700"
                >
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span className="line-through text-slate-400">{t.title}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  if (unfinishedToday.length > 0) setStep(2)
                  else handleFinish()
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-sm"
              >
                {unfinishedToday.length > 0 ? (
                  <>
                    Review Unfinished ({unfinishedToday.length}) <ArrowRight size={14} />
                  </>
                ) : (
                  'Done for Today'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Triage Unfinished */}
        {step === 2 && (
          <div className="mt-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Unfinished Tasks from Today ({unfinishedToday.length})
            </h4>
            <p className="text-xs text-slate-500">
              Decide whether to push these to tomorrow or send them back to the inbox.
            </p>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {unfinishedToday.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-xs"
                >
                  <span className="font-medium text-slate-800 truncate flex-1">{t.title}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => toggleTask(t.id)}
                      className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100"
                      title="Mark Done"
                    >
                      Done
                    </button>
                    <button
                      onClick={() => handlePushToTomorrow(t.id)}
                      className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
                      title="Move to tomorrow"
                    >
                      Tomorrow
                    </button>
                    <button
                      onClick={() => handleMoveToBacklog(t.id)}
                      className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
                      title="Move to backlog"
                    >
                      Inbox
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={handleFinish}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-sm"
              >
                Complete Review
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
