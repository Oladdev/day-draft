import { useEffect } from 'react'
import { useStore } from './store'
import { Sidebar } from './components/Sidebar'
import { MobileNavBar } from './components/MobileNavBar'
import { TodayView } from './views/TodayView'
import { WeekView } from './views/WeekView'
import { BoardView } from './views/BoardView'
import { OnboardingWizard } from './views/OnboardingWizard'
import { AuthView } from './views/AuthView'
import { QuickCapture } from './components/QuickCapture'
import { AddItemSheet } from './components/AddItemSheet'
import { EditItemModal } from './components/EditItemModal'
import { UserModal } from './components/UserModal'
import { EndOfDayReview } from './views/EndOfDayReview'
import { ErrorBoundary } from './components/ErrorBoundary'
import { DesktopTitlebar } from './components/DesktopTitlebar'
import { CommandPalette } from './components/CommandPalette'
import { LandingPage } from './landing/LandingPage'
import { supabase, isCloudConfigured } from './lib/supabase'
import { pullCloudData, subscribeToRealtime } from './lib/sync'
import { useState } from 'react'

export default function App() {
  const [showLanding, setShowLanding] = useState<boolean>(() => {
    // If URL contains ?app=true, bypass landing directly
    return !window.location.search.includes('app=true')
  })
  const view = useStore((s) => s.view)
  const items = useStore((s) => s.items)
  const user = useStore((s) => s.user)
  const settings = useStore((s) => s.settings)
  const setCapture = useStore((s) => s.setCapture)
  const login = useStore((s) => s.login)

  // Supabase Auth & Realtime Session Lifecycle
  useEffect(() => {
    if (!supabase || !isCloudConfigured) return

    // 1. Check active session on startup
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user
        const displayName = u.user_metadata?.display_name || u.email?.split('@')[0] || 'User'
        login(displayName, u.email || '')
        useStore.setState({ user: { id: u.id, name: displayName, email: u.email || '' } })
        subscribeToRealtime(u.id)
        pullCloudData(u.id)
      }
    })

    // 2. Listen to auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user
        const displayName = u.user_metadata?.display_name || u.email?.split('@')[0] || 'User'
        login(displayName, u.email || '')
        useStore.setState({ user: { id: u.id, name: displayName, email: u.email || '' } })
        subscribeToRealtime(u.id)
        pullCloudData(u.id)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [login])

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)

      if (isInput) return

      // Shift + A -> Quick Capture
      if (e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        setCapture(true)
        return
      }

      // 'c' or 'C' alone -> Quick Capture
      if (e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        setCapture(true)
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setCapture])

  // Show landing page on web by default
  if (showLanding) {
    return <LandingPage onLaunchApp={() => setShowLanding(false)} />
  }

  // Auth Gate: Require login before entering the workstation
  const isAuthGated = !user
  const showWizard = !settings.onboardingComplete && items.length === 0

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-100 font-sans text-slate-900 antialiased selection:bg-emerald-200 selection:text-emerald-900">
      {/* Native Desktop Custom Titlebar */}
      <DesktopTitlebar />

      <div className="flex flex-1 overflow-hidden min-h-0 relative">
        {isAuthGated || view === 'auth' ? (
          <ErrorBoundary>
            <AuthView />
          </ErrorBoundary>
        ) : showWizard || view === 'onboarding' ? (
          <ErrorBoundary>
            <OnboardingWizard />
          </ErrorBoundary>
        ) : (
          <>
            <Sidebar />

            <main className="flex-1 overflow-hidden min-w-0 relative">
              <ErrorBoundary>
                {view === 'today' && <TodayView />}
                {view === 'week' && <WeekView />}
                {view === 'board' && <BoardView />}
              </ErrorBoundary>
            </main>

            {/* Native Mobile Bottom Navigation Bar */}
            <MobileNavBar />
          </>
        )}
      </div>

      {/* Global Overlays & Modals */}
      <CommandPalette />
      <QuickCapture />
      <AddItemSheet />
      <EditItemModal />
      <UserModal />
      <EndOfDayReview />
    </div>
  )
}
