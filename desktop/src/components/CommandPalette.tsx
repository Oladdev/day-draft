import { useState, useEffect, useRef } from 'react'
import {
  Search,
  CalendarClock,
  CalendarRange,
  LayoutGrid,
  Plus,
  Zap,
  Moon,
  Flame,
  User,
  X,
  ArrowRight,
} from 'lucide-react'
import { useStore } from '../store'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const setView = useStore((s) => s.setView)
  const setAddSheet = useStore((s) => s.setAddSheet)
  const setCapture = useStore((s) => s.setCapture)
  const setEndOfDay = useStore((s) => s.setEndOfDay)
  const setUserModalOpen = useStore((s) => s.setUserModalOpen)
  const items = useStore((s) => s.items)
  const tasks = useStore((s) => s.tasks)
  const setEditModalItem = useStore((s) => s.setEditModalItem)

  // Listen for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      } else if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setSelectedIndex(0)
    }
  }, [open])

  if (!open) return null

  // Build command suggestions
  const defaultActions = [
    {
      id: 'nav-today',
      title: 'Go to Today Timeline',
      icon: CalendarClock,
      action: () => setView('today'),
      category: 'Navigation',
    },
    {
      id: 'nav-week',
      title: 'Go to Week View',
      icon: CalendarRange,
      action: () => setView('week'),
      category: 'Navigation',
    },
    {
      id: 'nav-board',
      title: 'Go to Task Board',
      icon: LayoutGrid,
      action: () => setView('board'),
      category: 'Navigation',
    },
    {
      id: 'action-add',
      title: 'Add Schedule Item / Class / Routine',
      icon: Plus,
      action: () => setAddSheet(true),
      category: 'Actions',
    },
    {
      id: 'action-capture',
      title: 'Quick Capture Task',
      icon: Zap,
      action: () => setCapture(true),
      category: 'Actions',
    },
    {
      id: 'action-review',
      title: 'Start End of Day Review',
      icon: Moon,
      action: () => setEndOfDay(true),
      category: 'Actions',
    },
    {
      id: 'action-profile',
      title: 'User Profile & Settings',
      icon: User,
      action: () => setUserModalOpen(true),
      category: 'Preferences',
    },
  ]

  // Filter tasks and schedule items matching query
  const matchingItems = items
    .filter((it) => it.title.toLowerCase().includes(query.toLowerCase()))
    .map((it) => ({
      id: `item-${it.id}`,
      title: `${it.title} (${it.type})`,
      icon: CalendarClock,
      action: () => setEditModalItem({ item: it, itemType: 'schedule' }),
      category: 'Schedule',
    }))

  const matchingTasks = tasks
    .filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
    .map((t) => ({
      id: `task-${t.id}`,
      title: t.title,
      icon: LayoutGrid,
      action: () => setEditModalItem({ item: t, itemType: 'task' }),
      category: 'Tasks',
    }))

  const filtered = query.trim()
    ? [
        ...defaultActions.filter((a) => a.title.toLowerCase().includes(query.toLowerCase())),
        ...matchingItems,
        ...matchingTasks,
      ]
    : defaultActions

  const handleSelect = (idx: number) => {
    const item = filtered[idx]
    if (item) {
      item.action()
      setOpen(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/60 p-4 backdrop-blur-xs select-none"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900 text-white shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center border-b border-slate-800 px-4 py-3.5">
          <Search size={18} className="text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex((prev) => (prev + 1) % filtered.length)
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length)
              } else if (e.key === 'Enter') {
                e.preventDefault()
                handleSelect(selectedIndex)
              }
            }}
            placeholder="Type a command or search tasks, classes, routines... (↑/↓ to navigate)"
            className="w-full bg-transparent text-sm font-medium text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No matching commands or items.</div>
          ) : (
            filtered.map((entry, idx) => {
              const Icon = entry.icon
              const isSelected = idx === selectedIndex
              return (
                <button
                  key={entry.id}
                  onClick={() => handleSelect(idx)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs transition-colors ${
                    isSelected ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon size={16} className={isSelected ? 'text-white' : 'text-slate-400'} />
                    <span className="truncate">{entry.title}</span>
                  </div>
                  <span className={`text-[10px] uppercase font-mono ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                    {entry.category}
                  </span>
                </button>
              )
            })
          )}
        </div>

        {/* Footer Helper */}
        <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-950 px-4 py-2 text-[11px] text-slate-500 font-mono">
          <span>Navigation: <kbd className="text-slate-400">↑</kbd> <kbd className="text-slate-400">↓</kbd></span>
          <span>Select: <kbd className="text-slate-400">↵ Enter</kbd></span>
          <span>Open anytime: <kbd className="text-slate-400">Ctrl+K</kbd></span>
        </div>
      </div>
    </div>
  )
}
