import { useEffect, useMemo, useState } from 'react'
import { useStore } from './store'
import { layoutDay, nowNext } from './lib/schedule'
import { todayISO } from './lib/time'
import { TopBar } from './components/TopBar'
import { NowHud } from './components/NowHud'
import { Timeline } from './components/Timeline'
import { Backlog } from './components/Backlog'
import { QuickCapture } from './components/QuickCapture'
import { AddBlockDialog } from './components/AddBlockDialog'
import { ENERGY_LABEL, type Energy } from './lib/types'
import { ENERGY_UI } from './lib/colors'

export default function App() {
  const blocks = useStore((s) => s.blocks)
  const settings = useStore((s) => s.settings)
  const date = useStore((s) => s.date)
  const captureOpen = useStore((s) => s.captureOpen)
  const setCapture = useStore((s) => s.setCapture)

  // Live clock — drives the countdown, the "now" line and now/next.
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const curMin = useMemo(() => {
    const d = new Date(now)
    return d.getHours() * 60 + d.getMinutes()
  }, [now])

  const isToday = date === todayISO()
  const dayBlocks = useMemo(() => blocks.filter((b) => b.date === date), [blocks, date])
  const layout = useMemo(() => layoutDay(dayBlocks, settings), [dayBlocks, settings])
  const nn = useMemo(
    () => (isToday ? nowNext(layout.placed, curMin) : { current: undefined, next: layout.placed[0] }),
    [layout, curMin, isToday],
  )

  const [addOpen, setAddOpen] = useState(false)

  // Global hotkey: "C" opens quick-capture (unless typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const typing =
        el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key.toLowerCase() === 'c') {
        e.preventDefault()
        setCapture(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setCapture])

  return (
    <div className="min-h-full">
      <TopBar layout={layout} onAddBlock={() => setAddOpen(true)} />

      <main className="mx-auto max-w-6xl px-4 py-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_20rem]">
          {/* main column */}
          <div className="space-y-4">
            <NowHud current={nn.current} next={nn.next} curMin={curMin} now={now} />

            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-slate-700">Your day</h3>
              <div className="flex items-center gap-3">
                {(['alpha', 'medium', 'admin'] as Energy[]).map((e) => (
                  <span key={e} className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                    <span className={`h-1.5 w-1.5 rounded-full ${ENERGY_UI[e].dot}`} />
                    {ENERGY_LABEL[e]}
                  </span>
                ))}
              </div>
            </div>

            <Timeline layout={layout} settings={settings} curMin={curMin} isToday={isToday} />
          </div>

          {/* right column */}
          <aside className="lg:sticky lg:top-[4.5rem] lg:h-[calc(100vh-6rem)]">
            <Backlog />
          </aside>
        </div>
      </main>

      {captureOpen && <QuickCapture />}
      {addOpen && <AddBlockDialog onClose={() => setAddOpen(false)} />}
    </div>
  )
}
