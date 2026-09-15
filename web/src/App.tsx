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

export default function App() {
  const view = useStore((s) => s.view)
  const items = useStore((s) => s.items)
  const settings = useStore((s) => s.settings)
  const setCapture = useStore((s) => s.setCapture)

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

  // Show onboarding wizard if not completed and no items exist
  const showWizard = !settings.onboardingComplete && items.length === 0

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900 antialiased selection:bg-emerald-200 selection:text-emerald-900">
      {view === 'auth' ? (
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

      {/* Global Overlays & Modals */}
      <QuickCapture />
      <AddItemSheet />
      <EditItemModal />
      <UserModal />
      <EndOfDayReview />
    </div>
  )
}
