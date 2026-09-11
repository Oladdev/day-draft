import { useEffect, useRef, useState } from 'react'
import { Zap } from 'lucide-react'
import { useStore } from '../store'
import { Modal } from './Modal'

export function QuickCapture() {
  const quickCapture = useStore((s) => s.quickCapture)
  const setCapture = useStore((s) => s.setCapture)
  const [value, setValue] = useState('')
  const [justAdded, setJustAdded] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const add = () => {
    const v = value.trim()
    if (!v) return
    quickCapture(v)
    setJustAdded((a) => [v, ...a].slice(0, 5))
    setValue('')
  }

  return (
    <Modal title="Quick capture" onClose={() => setCapture(false)}>
      <div className="flex items-center gap-2">
        <Zap size={18} className="shrink-0 text-amber-500" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') add()
          }}
          placeholder="Dump the thought… (Enter to add, Esc to close)"
          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
      </div>
      <p className="mt-2 text-xs text-slate-400">
        Lands in your Backlog inbox tagged <span className="font-medium text-amber-600">Admin</span>{' '}
        — triage it later. Keep typing to capture several.
      </p>
      {justAdded.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3">
          {justAdded.map((t, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {t}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
