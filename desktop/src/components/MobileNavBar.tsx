import { CalendarClock, CalendarRange, LayoutGrid, Plus, Moon } from 'lucide-react'
import type { View } from '../lib/types'
import { useStore } from '../store'

export function MobileNavBar() {
  const view = useStore((s) => s.view)
  const setView = useStore((s) => s.setView)
  const setAddSheet = useStore((s) => s.setAddSheet)
  const setEndOfDay = useStore((s) => s.setEndOfDay)
  const tasks = useStore((s) => s.tasks)

  const activeTaskCount = tasks.filter((t) => t.status !== 'done').length

  const navItem = (v: View, label: string, icon: React.ReactNode, badge?: number) => {
    const active = view === v
    return (
      <button
        onClick={() => setView(v)}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        className={`relative flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-2xl transition-all min-h-[44px] min-w-[48px] ${
          active ? 'text-emerald-700 font-bold' : 'text-slate-500 font-medium'
        }`}
      >
        <div className={`transition-transform duration-150 ${active ? 'scale-110' : ''}`}>
          {icon}
        </div>
        <span className="text-[10px] tracking-tight">{label}</span>
        {badge !== undefined && badge > 0 && (
          <span className="absolute top-0.5 right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-black text-white">
            {badge}
          </span>
        )}
      </button>
    )
  }

  return (
    <nav
      aria-label="Mobile navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 sm:px-3 py-1.5 flex items-center justify-around shadow-lg select-none safe-area-bottom"
    >
      {/* Today */}
      {navItem('today', 'Today', <CalendarClock size={20} />)}

      {/* Week */}
      {navItem('week', 'Week', <CalendarRange size={20} />)}

      {/* Elevated Center Add Button (+) */}
      <button
        onClick={() => setAddSheet(true)}
        className="-mt-5 flex h-13 w-13 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 active:scale-95 transition-transform hover:bg-emerald-500 min-h-[48px] min-w-[48px]"
        aria-label="Add new item or task"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* Board */}
      {navItem('board', 'Board', <LayoutGrid size={20} />, activeTaskCount)}

      {/* Day Review */}
      <button
        onClick={() => setEndOfDay(true)}
        aria-label="End of Day Review"
        className="flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-2xl text-slate-500 font-medium transition-colors hover:text-indigo-600 min-h-[44px] min-w-[48px]"
      >
        <Moon size={20} className="text-indigo-600" />
        <span className="text-[10px] tracking-tight text-slate-600 font-semibold">Review</span>
      </button>
    </nav>
  )
}
