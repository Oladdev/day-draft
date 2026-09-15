import { CalendarClock, CalendarRange, LayoutGrid, Zap, Plus, Moon, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import type { View } from '../lib/types'
import { useStore } from '../store'

interface NavItem {
  view: View
  label: string
  icon: ReactNode
  badge?: string
}

export function Sidebar() {
  const view = useStore((s) => s.view)
  const setView = useStore((s) => s.setView)
  const setCapture = useStore((s) => s.setCapture)
  const setAddSheet = useStore((s) => s.setAddSheet)
  const setEndOfDay = useStore((s) => s.setEndOfDay)
  const setUserModalOpen = useStore((s) => s.setUserModalOpen)
  const resetToSampleData = useStore((s) => s.resetToSampleData)
  const tasks = useStore((s) => s.tasks)
  const items = useStore((s) => s.items)
  const user = useStore((s) => s.user)

  const activeTaskCount = tasks.filter((t) => t.status !== 'done').length

  const navItems: NavItem[] = [
    { view: 'today', label: 'Today', icon: <CalendarClock size={20} /> },
    { view: 'week', label: 'Week View', icon: <CalendarRange size={20} /> },
    {
      view: 'board',
      label: 'Task Board',
      icon: <LayoutGrid size={20} />,
      badge: activeTaskCount > 0 ? String(activeTaskCount) : undefined,
    },
  ]

  return (
    <aside className="hidden lg:flex h-screen w-64 flex-col border-r border-slate-200/80 bg-white select-none shrink-0 shadow-xs">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm shadow-emerald-700/20">
            <span className="text-xl">🌿</span>
          </div>
          <div className="overflow-hidden">
            <h1 className="text-base font-bold tracking-tight text-slate-900 leading-tight">
              Day Draft
            </h1>
            <p className="text-[11px] font-semibold text-emerald-800 tracking-tight truncate">
              {user?.name || 'Workspace'}
            </p>
          </div>
        </div>

        {/* Profile Trigger */}
        <button
          onClick={() => setUserModalOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors border border-slate-200"
          title="Open User Profile & Settings"
          aria-label="Open User Profile & Settings"
        >
          {user?.avatarUrl || user?.name?.charAt(0).toUpperCase() || '👤'}
        </button>
      </div>

      {/* Universal Prominent "+ Add" Action */}
      <div className="p-4 pb-2">
        <button
          onClick={() => setAddSheet(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-600/30 transition-all active:scale-[0.98]"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Add New...</span>
        </button>
      </div>

      {/* Main Navigation */}
      <nav aria-label="Main sidebar navigation" className="flex-1 space-y-1.5 p-4 pt-2">
        <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>

        {navItems.map((item) => {
          const active = view === item.view
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              aria-current={active ? 'page' : undefined}
              className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-bold transition-all ${
                active
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className={`shrink-0 ${active ? 'text-emerald-700' : 'text-slate-400'}`}>
                {item.icon}
              </div>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-black ${
                    active ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}

        {/* Quick Tools */}
        <div className="pt-5 space-y-1.5">
          <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Quick Tools
          </div>

          <button
            onClick={() => setCapture(true)}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-200/80 px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            <Zap size={17} className="shrink-0 text-amber-500 fill-amber-500" />
            <span className="text-left flex-1">Quick Capture</span>
            <kbd className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 font-mono">
              C
            </kbd>
          </button>

          <button
            onClick={() => setEndOfDay(true)}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-200/80 px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            <Moon size={17} className="shrink-0 text-indigo-500" />
            <span className="text-left flex-1">Day Review</span>
          </button>

          <button
            onClick={() => {
              window.location.href = '/'
            }}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-200/80 px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            <Sparkles size={17} className="shrink-0 text-emerald-600" />
            <span className="text-left flex-1">Downloads & Landing</span>
          </button>
        </div>
      </nav>

      {/* Footer / Presets & Settings */}
      <div className="p-4 border-t border-slate-100">
        {items.length === 0 ? (
          <button
            onClick={resetToSampleData}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors border border-emerald-200"
          >
            <Sparkles size={15} className="text-emerald-600 shrink-0" />
            <span>Load Ola's Schedule</span>
          </button>
        ) : (
          <button
            onClick={() => setView('onboarding')}
            className="flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Sparkles size={15} className="text-slate-400 shrink-0" />
            <span>Setup Wizard</span>
          </button>
        )}
      </div>
    </aside>
  )
}
