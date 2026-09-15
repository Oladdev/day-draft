import { useState, useEffect } from 'react'
import {
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useStore } from '../store'
import { supabase, isCloudConfigured } from '../lib/supabase'
import { pullCloudData, subscribeToRealtime } from '../lib/sync'
import { authenticateWithBiometrics, isBiometricsAvailable } from '../lib/useBiometrics'
import { Fingerprint } from 'lucide-react'

export function AuthView() {
  const setView = useStore((s) => s.setView)
  const login = useStore((s) => s.login)
  const user = useStore((s) => s.user)

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [hasBiometrics, setHasBiometrics] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    isBiometricsAvailable().then((avail) => setHasBiometrics(avail))
  }, [])

  const handleBiometricAuth = async () => {
    setError('')
    const result = await authenticateWithBiometrics()
    if (result.success && result.email) {
      login(result.email.split('@')[0], result.email)
      setSuccessMsg('Windows Hello Biometric Verified!')
      setTimeout(() => setView('today'), 350)
    } else {
      setError('Biometric authentication cancelled or not yet registered. Sign in first to enable.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedEmail = email.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Please provide your name or username.')
      return
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    const displayName = mode === 'signup' ? name.trim() : user?.name || trimmedEmail.split('@')[0]

    // ZERO HALLUCINATION: Require real Supabase backend connection
    if (!supabase || !isCloudConfigured) {
      setError('Cloud authentication is not configured. Add valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file, or click "Continue as Guest" below for offline local storage.')
      return
    }

    setLoading(true)
    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: { display_name: displayName },
          },
        })

        if (signUpError) {
          setError(signUpError.message)
          setLoading(false)
          return
        }

        const authUser = data.user
        if (authUser) {
          login(displayName, trimmedEmail)
          useStore.setState({ user: { id: authUser.id, name: displayName, email: trimmedEmail } })
          subscribeToRealtime(authUser.id)
          pullCloudData(authUser.id)
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        })

        if (signInError) {
          setError(signInError.message)
          setLoading(false)
          return
        }

        const authUser = data.user
        if (authUser) {
          login(displayName, trimmedEmail)
          useStore.setState({ user: { id: authUser.id, name: displayName, email: trimmedEmail } })
          subscribeToRealtime(authUser.id)
          pullCloudData(authUser.id)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error from server')
      setLoading(false)
      return
    }
    setLoading(false)

    setSuccessMsg(
      mode === 'signup' ? 'Account created! Connecting workspace...' : 'Signed in successfully!'
    )

    setTimeout(() => {
      setView('today')
    }, 400)
  }

  const handleContinueAsGuest = () => {
    if (!user) {
      login('Guest User', 'guest@daydraft.local')
    }
    setView('today')
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50/90 p-4 sm:p-6 select-none">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl transition-all">
        {/* Top Brand Banner */}
        <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 px-6 py-8 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl shadow-inner backdrop-blur-md mb-3">
            🌿
          </div>
          <h2 className="text-2xl font-black tracking-tight">Day Draft</h2>
          <p className="text-xs text-emerald-100 font-medium mt-1">
            Student & Professional Schedule Engine
          </p>

          {/* Honest Storage / Readiness Status Badge */}
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-950/40 border border-emerald-400/30 px-3.5 py-1 text-[11px] font-semibold text-emerald-100 backdrop-blur-sm">
            <HardDrive size={12} className="text-emerald-300" />
            <span>Encrypted Local Storage · Offline First</span>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-100 bg-slate-50/60 p-1.5" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signin'}
            onClick={() => {
              setMode('signin')
              setError('')
            }}
            className={`flex-1 rounded-2xl py-2.5 text-xs font-bold transition-all ${
              mode === 'signin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            onClick={() => {
              setMode('signup')
              setError('')
            }}
            className={`flex-1 rounded-2xl py-2.5 text-xs font-bold transition-all ${
              mode === 'signup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          {error && (
            <div
              role="alert"
              className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700"
            >
              {error}
            </div>
          )}

          {successMsg && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800"
            >
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              {successMsg}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label
                htmlFor="auth-name-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
              >
                Full Name / Username
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="auth-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ola"
                  aria-label="Full Name or Username"
                  className="w-full rounded-2xl border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                aria-label="Email Address"
                className="w-full rounded-2xl border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="auth-password-input"
                className="text-xs font-bold uppercase tracking-wider text-slate-600"
              >
                Password
              </label>
              {mode === 'signin' && (
                <span className="text-[11px] font-medium text-slate-400">
                  Local device key
                </span>
              )}
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                id="auth-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                aria-label="Password"
                className="w-full rounded-2xl border border-slate-300 py-2.5 pl-10 pr-10 text-sm text-slate-900 font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Remember this device
            </label>

            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
              <ShieldCheck size={14} className="text-emerald-600" /> Local Encrypted
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-500 active:scale-[0.99] transition-all min-h-[44px] disabled:opacity-60"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>
                  {mode === 'signin'
                    ? isCloudConfigured
                      ? 'Sign In & Sync Devices'
                      : 'Sign In to Workspace'
                    : isCloudConfigured
                    ? 'Create Account & Cloud Sync'
                    : 'Create Local Account'}
                </span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {hasBiometrics && mode === 'signin' && (
            <button
              type="button"
              onClick={handleBiometricAuth}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-slate-50/80 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors min-h-[44px]"
            >
              <Fingerprint size={16} className="text-emerald-600" />
              Sign in with Windows Hello / Touch ID
            </button>
          )}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-bold tracking-wider">
                Or Continue Offline
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleContinueAsGuest}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors min-h-[44px]"
          >
            <Sparkles size={14} className="text-amber-500" />
            Continue as Guest (Local Only)
          </button>
        </form>
      </div>
    </div>
  )
}
