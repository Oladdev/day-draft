import { useState } from 'react'
import { Sparkles, BookOpen, Users, Repeat, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useStore } from '../store'

export function OnboardingWizard() {
  const completeOnboarding = useStore((s) => s.completeOnboarding)
  const resetToSampleData = useStore((s) => s.resetToSampleData)
  const addItem = useStore((s) => s.addItem)

  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Step 1: Classes
  const [classes, setClasses] = useState([
    { title: 'Data Structures & Algorithms', days: [1, 3, 5], time: '09:00', duration: 90, location: 'Hall 3' },
    { title: 'Computer Architecture', days: [2, 4], time: '11:00', duration: 90, location: 'Lab 2' },
  ])
  const [newClassTitle, setNewClassTitle] = useState('')
  const [newClassTime, setNewClassTime] = useState('09:00')

  // Step 2: Meetings
  const [meetings, setMeetings] = useState([
    { title: 'Software Engineering Group Standup', days: [2, 4], time: '14:00', duration: 30 },
  ])
  const [newMeetingTitle, setNewMeetingTitle] = useState('')

  // Step 3: Routines & Reading
  const [routines, setRoutines] = useState([
    { title: 'Deep Work / Programming', duration: 90, window: 'morning', type: 'routine' as const },
    { title: 'Technical Reading (System Design)', duration: 45, window: 'evening', type: 'reading' as const },
  ])
  const [newRoutineTitle, setNewRoutineTitle] = useState('')
  const [newRoutineType, setNewRoutineType] = useState<'routine' | 'reading'>('routine')

  const handleFinish = () => {
    // Add all configured classes
    for (const c of classes) {
      addItem({
        type: 'class',
        title: c.title,
        startTime: c.time,
        duration: c.duration,
        location: c.location,
        color: 'emerald',
        recurrence: { type: 'weekly', days: c.days },
      })
    }

    // Add meetings
    for (const m of meetings) {
      addItem({
        type: 'meeting',
        title: m.title,
        startTime: m.time,
        duration: m.duration,
        color: 'teal',
        recurrence: { type: 'weekly', days: m.days },
      })
    }

    // Add routines & reading
    for (const r of routines) {
      addItem({
        type: r.type,
        title: r.title,
        duration: r.duration,
        preferredStart: r.window === 'morning' ? '07:00' : r.window === 'afternoon' ? '12:00' : '18:00',
        preferredEnd: r.window === 'morning' ? '12:00' : r.window === 'afternoon' ? '18:00' : '22:30',
        color: r.type === 'reading' ? 'indigo' : 'amber',
        recurrence: { type: 'daily' },
      })
    }

    completeOnboarding()
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50/80 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
        {/* Top Progress */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white text-lg shadow-xs">
              🌿
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Welcome to Day Draft</h2>
              <p className="text-xs text-slate-500">Configure your university schedule & routines</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Step {step} of 3
          </div>
        </div>

        {/* Step 1: Classes */}
        {step === 1 && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <BookOpen size={18} className="text-emerald-600" />
              Your Academic Classes (Lectures & Labs)
            </div>
            <p className="text-xs text-slate-500">
              Add your weekly university courses. They will automatically repeat each week.
            </p>

            <div className="space-y-2">
              {classes.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-emerald-950">{c.title}</span>
                    <div className="text-slate-500 mt-0.5">
                      {c.time} ({c.duration} min) · {c.location}
                    </div>
                  </div>
                  <button
                    onClick={() => setClasses(classes.filter((_, idx) => idx !== i))}
                    className="text-slate-400 hover:text-rose-600 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Quick add class */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newClassTitle}
                onChange={(e) => setNewClassTitle(e.target.value)}
                placeholder="Course name (e.g. Operating Systems)"
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
              />
              <input
                type="time"
                value={newClassTime}
                onChange={(e) => setNewClassTime(e.target.value)}
                className="rounded-xl border border-slate-300 px-2 py-2 text-xs focus:border-emerald-500 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (newClassTitle.trim()) {
                    setClasses([
                      ...classes,
                      { title: newClassTitle.trim(), days: [1, 3, 5], time: newClassTime, duration: 90, location: 'Campus' },
                    ])
                    setNewClassTitle('')
                  }
                }}
                className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Meetings */}
        {step === 2 && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Users size={18} className="text-teal-600" />
              Regular Meetings & Study Groups
            </div>
            <p className="text-xs text-slate-500">
              Add recurring project standups, committee sessions, or appointments.
            </p>

            <div className="space-y-2">
              {meetings.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-teal-100 bg-teal-50/60 p-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-teal-950">{m.title}</span>
                    <div className="text-slate-500 mt-0.5">{m.time} ({m.duration} min)</div>
                  </div>
                  <button
                    onClick={() => setMeetings(meetings.filter((_, idx) => idx !== i))}
                    className="text-slate-400 hover:text-rose-600 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newMeetingTitle}
                onChange={(e) => setNewMeetingTitle(e.target.value)}
                placeholder="Meeting name (e.g. Project Review)"
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (newMeetingTitle.trim()) {
                    setMeetings([
                      ...meetings,
                      { title: newMeetingTitle.trim(), days: [2, 4], time: '13:00', duration: 30 },
                    ])
                    setNewMeetingTitle('')
                  }
                }}
                className="rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-teal-500"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Routines & Reading */}
        {step === 3 && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Repeat size={18} className="text-amber-600" />
              Core Routines & Reading Habits
            </div>
            <p className="text-xs text-slate-500">
              These are flexible daily commitments: the engine automatically fits them into your open schedule gaps!
            </p>

            <div className="space-y-2">
              {routines.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-xl border p-3 text-xs ${
                    r.type === 'reading'
                      ? 'border-indigo-100 bg-indigo-50/60'
                      : 'border-amber-100 bg-amber-50/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-white border border-slate-200">
                        {r.type === 'reading' ? '📖 Reading' : '🔄 Routine'}
                      </span>
                      <span className="font-bold text-slate-900">{r.title}</span>
                    </div>
                    <div className="text-slate-500 mt-1">{r.duration} mins · {r.window} window</div>
                  </div>
                  <button
                    onClick={() => setRoutines(routines.filter((_, idx) => idx !== i))}
                    className="text-slate-400 hover:text-rose-600 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <select
                value={newRoutineType}
                onChange={(e) => setNewRoutineType(e.target.value as any)}
                className="rounded-xl border border-slate-300 px-2 py-2 text-xs bg-white text-slate-700"
              >
                <option value="routine">Routine</option>
                <option value="reading">Reading</option>
              </select>
              <input
                type="text"
                value={newRoutineTitle}
                onChange={(e) => setNewRoutineTitle(e.target.value)}
                placeholder={
                  newRoutineType === 'reading'
                    ? 'Reading title (e.g. System Design Interview)'
                    : 'Routine name (e.g. Algorithmic Practice)'
                }
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (newRoutineTitle.trim()) {
                    setRoutines([
                      ...routines,
                      {
                        title: newRoutineTitle.trim(),
                        duration: newRoutineType === 'reading' ? 45 : 60,
                        window: newRoutineType === 'reading' ? 'evening' : 'afternoon',
                        type: newRoutineType,
                      },
                    ])
                    setNewRoutineTitle('')
                  }
                }}
                className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
          <button
            onClick={resetToSampleData}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <Sparkles size={14} /> Use Ready-Made Preset
          </button>

          <div className="flex gap-2.5">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => (s - 1) as any)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep((s) => (s + 1) as any)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500"
              >
                Next <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-500"
              >
                <CheckCircle2 size={15} /> Complete Setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
