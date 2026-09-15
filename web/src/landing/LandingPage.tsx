import React from 'react'
import {
  Download,
  Monitor,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  Calendar,
  Layers,
  Clock,
  ExternalLink,
} from 'lucide-react'

interface LandingPageProps {
  onLaunchApp: () => void
}

export function LandingPage({ onLaunchApp }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-black text-lg shadow-lg shadow-emerald-500/20">
              🌿
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white">Day Draft</span>
              <span className="text-[10px] font-semibold text-emerald-400 tracking-wider uppercase">
                Workstation v0.1
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">
              Engine
            </a>
            <a href="#downloads" className="hover:text-white transition-colors">
              Downloads
            </a>
            <a href="#architecture" className="hover:text-white transition-colors">
              Architecture
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#downloads"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <Download size={14} className="text-emerald-400" />
              <span>Get Native App</span>
            </a>
            <button
              onClick={onLaunchApp}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Launch Web Cloud</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32 px-6">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-blue-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative mx-auto max-w-5xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300">
            <Sparkles size={13} className="text-emerald-400" />
            <span>Multi-platform: Windows .exe · Android .apk · Cloud Web</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            Your Day, <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
              Engineered for Deep Work.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
            The intelligent daily routine scheduler that treats fixed academic classes and fluid habits differently. 
            Auto-fits routines into free daylight gaps, protects downtime buffers, and syncs seamlessly across your PC and mobile.
          </p>

          {/* Direct Download & Launch CTAs */}
          <div id="downloads" className="pt-4 flex flex-wrap items-center justify-center gap-4">
            {/* Windows Desktop Download */}
            <a
              href="/downloads/Day-Draft-Setup.exe"
              download="Day-Draft-Setup.exe"
              className="group flex items-center gap-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 hover:border-emerald-500/60 p-4 px-5 text-left transition-all hover:bg-slate-850 hover:shadow-xl hover:shadow-emerald-500/10"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                <Monitor size={22} />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-400">Windows Native</div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  Download .EXE
                  <Download size={13} className="text-emerald-400" />
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Tauri v2 · x64 Installer</div>
              </div>
            </a>

            {/* Android Mobile Download */}
            <a
              href="/downloads/Day-Draft.apk"
              download="Day-Draft.apk"
              className="group flex items-center gap-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 hover:border-sky-500/60 p-4 px-5 text-left transition-all hover:bg-slate-850 hover:shadow-xl hover:shadow-sky-500/10"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 transition-colors">
                <Smartphone size={22} />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-400">Android Native</div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  Download .APK
                  <Download size={13} className="text-sky-400" />
                </div>
                <div className="text-[10px] text-slate-500 font-mono">React Native · Expo Build</div>
              </div>
            </a>

            {/* Web App CTA */}
            <button
              onClick={onLaunchApp}
              className="flex items-center gap-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-4 px-6 font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-950">Zero Install</span>
                <span className="text-base font-extrabold flex items-center gap-1.5">
                  Open Cloud App <ArrowRight size={16} />
                </span>
              </div>
            </button>
          </div>

          {/* Interactive Schedule Mock Preview */}
          <div className="mt-14 mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/90 p-4 sm:p-6 shadow-2xl backdrop-blur-sm text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">Day Draft Workstation · Schedule Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                  Capacity: 74%
                </span>
                <span className="text-xs text-slate-400 font-medium">Free Buffer: 2h 15m</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-start justify-between rounded-xl border-l-4 border-l-blue-500 bg-slate-800/60 p-3.5 border border-slate-700/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-blue-300">
                      Class
                    </span>
                    <span className="text-xs font-mono text-slate-400">09:00 AM – 10:30 AM (1h 30m)</span>
                  </div>
                  <div className="mt-1 text-sm font-bold text-white">Advanced Operating Systems (CSC 401)</div>
                  <div className="text-xs text-slate-400">📍 Science Complex Lab 4 · Dr. Adebayo</div>
                </div>
                <span className="rounded-md bg-blue-950/60 border border-blue-800/40 px-2 py-1 text-[11px] font-semibold text-blue-300">
                  Fixed Commitment
                </span>
              </div>

              <div className="flex items-start justify-between rounded-xl border-l-4 border-l-emerald-500 bg-slate-800/60 p-3.5 border border-slate-700/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-300">
                      Routine
                    </span>
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <Sparkles size={11} /> Auto-fitted in Free Gap: 10:45 AM – 11:30 AM
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-bold text-white">Algorithms & Data Structures Problem Set</div>
                  <div className="text-xs text-slate-400">Deep Work · Focus Mode Ready</div>
                </div>
                <span className="rounded-md bg-emerald-950/60 border border-emerald-800/40 px-2 py-1 text-[11px] font-semibold text-emerald-300">
                  Fluid Rhythm
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Architecture */}
      <section id="features" className="border-t border-slate-900 bg-slate-900/40 py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Usability-Engineered Productivity</h2>
            <p className="mt-3 text-slate-400 text-sm">
              Designed around Nielsen Norman heuristics: zero cognitive overload, conflict-free layouts, and instant response times.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Layers size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Fixed vs Fluid Architecture</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Never drag blocks around when a meeting runs late. Fixed items anchor in place; fluid routines slide dynamically into the most optimal daytime intervals.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Native Biometric Vault</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Unlock your schedule with Windows Hello, Touch ID, or Face ID. Zero mock fallbacks—hard cryptographic passkeys for your private workspace.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Zap size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Realtime Supabase Cloud</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Powered by Supabase PostgreSQL and Row-Level Security. Edit a task on your PC, and it instantly replicates to your mobile with conflict-free merging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-10 px-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>🌿 Day Draft Workstation</span>
            <span>·</span>
            <span>Built by Olawole Precious Atolagbe (Ola)</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Oladdev/day-draft"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition-colors flex items-center gap-1"
            >
              GitHub <ExternalLink size={11} />
            </a>
            <span>·</span>
            <span>WCAG 2.1 Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
