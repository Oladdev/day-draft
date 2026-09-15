import { useState, useRef } from 'react'
import {
  X,
  User,
  HardDrive,
  LogOut,
  Download,
  Upload,
  Sliders,
  Check,
  CheckCircle2,
  Trash2,
} from 'lucide-react'
import { useStore } from '../store'
import { isCloudConfigured } from '../lib/supabase'

export function UserModal() {
  const userModalOpen = useStore((s) => s.userModalOpen)
  const setUserModalOpen = useStore((s) => s.setUserModalOpen)
  const user = useStore((s) => s.user)
  const syncStatus = useStore((s) => s.syncStatus)
  const lastSyncedAt = useStore((s) => s.lastSyncedAt)
  const login = useStore((s) => s.login)
  const logout = useStore((s) => s.logout)
  const importData = useStore((s) => s.importData)
  const setView = useStore((s) => s.setView)

  const items = useStore((s) => s.items)
  const tasks = useStore((s) => s.tasks)
  const overrides = useStore((s) => s.overrides)
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)

  const [activeTab, setActiveTab] = useState<'profile' | 'sync' | 'preferences'>('profile')
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [avatarEmoji, setAvatarEmoji] = useState(user?.avatarUrl || '👨‍💻')
  const [saveToast, setSaveToast] = useState(false)
  const [importStatus, setImportStatus] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  if (!userModalOpen) return null

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return

    login(name.trim(), email.trim())
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 2000)
  }

  const handleExportData = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      user,
      settings,
      items,
      tasks,
      overrides,
    }
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2))
    const dl = document.createElement('a')
    dl.setAttribute('href', dataStr)
    dl.setAttribute('download', `day-draft-backup-${new Date().toISOString().slice(0, 10)}.json`)
    dl.click()
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        const success = importData(content)
        if (success) {
          setImportStatus('Backup restored successfully!')
        } else {
          setImportStatus('Failed to restore backup: Invalid JSON format.')
        }
        setTimeout(() => setImportStatus(null), 3000)
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const avatarOptions = ['👨‍💻', '👩‍💻', '🚀', '⚡', '🌿', '🎓', '🎯', '🔥']

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-150 select-none"
      onClick={() => setUserModalOpen(false)}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-slate-300 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 font-black text-lg">
              {avatarEmoji}
            </span>
            <div>
              <h3 id="user-modal-title" className="text-base font-bold text-slate-900">
                User Profile & Workspace Settings
              </h3>
              <p className="text-xs text-slate-400">Manage account details & data backup</p>
            </div>
          </div>
          <button
            onClick={() => setUserModalOpen(false)}
            aria-label="Close user profile modal"
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mt-3 flex rounded-xl bg-slate-100 p-1 text-xs font-bold" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
            className={`flex-1 rounded-lg py-2 transition-all min-h-[40px] ${
              activeTab === 'profile'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Profile Info
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'sync'}
            onClick={() => setActiveTab('sync')}
            className={`flex-1 rounded-lg py-2 transition-all flex items-center justify-center gap-1.5 min-h-[40px] ${
              activeTab === 'sync'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <HardDrive size={14} className="text-slate-600" />
            Data & Backup
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'preferences'}
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 rounded-lg py-2 transition-all min-h-[40px] ${
              activeTab === 'preferences'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Preferences
          </button>
        </div>

        {/* TAB 1: PROFILE INFO */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
            {saveToast && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800 animate-in fade-in"
              >
                <Check size={16} className="text-emerald-600" />
                Profile updated successfully!
              </div>
            )}

            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Choose Profile Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {avatarOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatarEmoji(emoji)}
                    aria-label={`Select profile avatar ${emoji}`}
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl text-lg border transition-all ${
                      avatarEmoji === emoji
                        ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20 scale-105'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="profile-name-field"
                className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1"
              >
                Full Name / Username
              </label>
              <input
                id="profile-name-field"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ola"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label
                htmlFor="profile-email-field"
                className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1"
              >
                Email Address
              </label>
              <input
                id="profile-email-field"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setUserModalOpen(false)
                  setView('auth')
                }}
                className="text-xs font-semibold text-slate-500 hover:text-emerald-700 min-h-[44px] flex items-center"
              >
                Switch Account / Sign In →
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-colors min-h-[44px]"
              >
                <User size={14} /> Save Profile
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: DATA & BACKUP */}
        {activeTab === 'sync' && (
          <div className="mt-4 space-y-4">
            {importStatus && (
              <div
                role="status"
                className={`flex items-center gap-2 rounded-xl p-3 text-xs font-bold ${
                  importStatus.includes('success')
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                <CheckCircle2 size={16} />
                {importStatus}
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <HardDrive size={16} className="text-emerald-600" />
                  Local Device Storage
                </div>
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-black border border-emerald-300">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-600">
                All classes, routines, tasks, and settings are securely stored inside your local browser.
              </p>
              <div className="text-[11px] text-slate-400 font-medium">
                Last saved:{' '}
                {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : 'Never'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Backup & Restore
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleExportData}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs min-h-[44px]"
                >
                  <Download size={14} className="text-slate-500" /> Export JSON
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs min-h-[44px]"
                >
                  <Upload size={14} className="text-slate-500" /> Restore Backup
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportFile}
                  accept=".json,application/json"
                  className="hidden"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold text-slate-800">Supabase Multi-Device Cloud Sync</div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                    isCloudConfigured
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border border-amber-300'
                  }`}
                >
                  {isCloudConfigured ? 'CONNECTED' : 'KEYS REQUIRED'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isCloudConfigured
                  ? 'Realtime PostgreSQL CDC replication is active. Changes automatically synchronize across your phone and PC in milliseconds.'
                  : 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment (.env) to activate instant multi-device sync.'}
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: PREFERENCES */}
        {activeTab === 'preferences' && (
          <div className="mt-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-3.5">
                <div>
                  <div className="text-xs font-bold text-slate-900">Target Daily Free Time</div>
                  <div className="text-[11px] text-slate-500">Alert if free time drops below this threshold</div>
                </div>
                <select
                  aria-label="Target Daily Free Time"
                  value={settings.targetFreeMin}
                  onChange={(e) => updateSettings({ targetFreeMin: Number(e.target.value) })}
                  className="rounded-xl border border-slate-300 px-2 py-1.5 text-xs font-semibold bg-white min-h-[40px]"
                >
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                </select>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-3.5">
                <div>
                  <div className="text-xs font-bold text-slate-900">Windows Hello / Biometric Sign-in</div>
                  <div className="text-[11px] text-slate-500">Enable fast login using fingerprint or PIN</div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!user?.email) return
                    const { registerBiometricCredential } = await import('../lib/useBiometrics')
                    const ok = await registerBiometricCredential(user.email)
                    if (ok) alert('Windows Hello biometric passkey registered successfully!')
                    else alert('Could not register biometrics on this browser or platform.')
                  }}
                  className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 min-h-[36px]"
                >
                  Configure Key
                </button>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-3.5">
                <div>
                  <div className="text-xs font-bold text-slate-900">Day Schedule Window</div>
                  <div className="text-[11px] text-slate-500">Default timeline wake / sleep boundaries</div>
                </div>
                <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                  07:00 AM – 11:00 PM
                </div>
              </div>
            </div>

            {/* Data Management Actions */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                onClick={() => {
                  logout()
                  setUserModalOpen(false)
                  setView('auth')
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors min-h-[44px]"
              >
                <LogOut size={14} /> Sign Out of Day Draft
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
