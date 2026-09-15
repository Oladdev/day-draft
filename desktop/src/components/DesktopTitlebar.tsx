import { useState, useEffect } from 'react'
import {
  Minus,
  Square,
  X,
  HardDrive,
  Cloud,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import { useStore } from '../store'
import { isCloudConfigured } from '../lib/supabase'

export function DesktopTitlebar() {
  const syncStatus = useStore((s) => s.syncStatus)
  const user = useStore((s) => s.user)
  const [isMaximized, setIsMaximized] = useState(false)

  const handleMinimize = () => {
    // In Tauri desktop environment
    if ((window as any).__TAURI__) {
      (window as any).__TAURI__.window.appWindow.minimize()
    }
  }

  const handleMaximize = () => {
    if ((window as any).__TAURI__) {
      (window as any).__TAURI__.window.appWindow.toggleMaximize()
      setIsMaximized(!isMaximized)
    } else {
      setIsMaximized(!isMaximized)
    }
  }

  const handleClose = () => {
    if ((window as any).__TAURI__) {
      (window as any).__TAURI__.window.appWindow.close()
    }
  }

  return (
    <header
      data-tauri-drag-region
      className="hidden lg:flex h-10 w-full items-center justify-between border-b border-slate-200/80 bg-slate-900 text-slate-300 px-3 select-none shrink-0 z-50 text-xs font-medium"
    >
      {/* Left: App Branding & Workspace indicator */}
      <div className="flex items-center gap-2.5 pointer-events-none">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-600 text-white text-[11px] font-black shadow-2xs">
          🌿
        </span>
        <span className="font-bold text-white tracking-tight">Day Draft</span>
        <span className="text-slate-600">/</span>
        <span className="text-slate-400 font-mono text-[11px]">
          {user?.name ? `${user.name}'s Workspace` : 'Local Workspace'}
        </span>
      </div>

      {/* Center: Draggable Status Pill */}
      <div
        data-tauri-drag-region
        className="flex items-center gap-2 rounded-full bg-slate-800/90 border border-slate-700/60 px-3 py-1 cursor-move"
      >
        {isCloudConfigured ? (
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
            <Cloud size={12} className="text-emerald-400" />
            <span>Cloud Connected (PostgreSQL)</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <HardDrive size={12} className="text-slate-400" />
            <span>Local Vault (Encrypted)</span>
          </span>
        )}
      </div>

      {/* Right: Window Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleMinimize}
          aria-label="Minimize Window"
          className="flex h-7 w-8 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Minus size={13} />
        </button>

        <button
          onClick={handleMaximize}
          aria-label="Maximize Window"
          className="flex h-7 w-8 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Square size={11} />
        </button>

        <button
          onClick={handleClose}
          aria-label="Close Window"
          className="flex h-7 w-8 items-center justify-center rounded text-slate-400 hover:bg-rose-600 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </header>
  )
}
