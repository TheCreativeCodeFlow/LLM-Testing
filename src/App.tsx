import { lazy, Suspense } from 'react'
import { Sidebar } from '@/features/sidebar/Sidebar'
import { Workspace } from '@/features/workspace/Workspace'
import { ThemeProvider } from '@/app/ThemeProvider'
import { QueryProvider } from '@/app/QueryProvider'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PanelSkeleton, GlobalSpinner } from '@/components/LoadingFallback'

// Lazy loaded dashboard widgets
const DeveloperPanel = lazy(() => import('@/features/developer-panel/DeveloperPanel'))
const SettingsModal = lazy(() => import('@/features/workspace/SettingsModal'))

function AppContent() {
  const developerModeEnabled = useWorkspaceStore((state) => state.developerModeEnabled)

  return (
    <div
      className="flex h-screen w-screen overflow-hidden bg-background text-foreground transition-colors duration-300"
      role="application"
      aria-label="DSA Tutor Playground Workspace"
    >
      {/* Left Sidebar */}
      <ErrorBoundary>
        <Sidebar />
      </ErrorBoundary>

      {/* Center Workspace */}
      <ErrorBoundary>
        <main className="flex-1 h-full overflow-hidden" role="main">
          <Workspace />
        </main>
      </ErrorBoundary>

      {/* Right Developer Panel */}
      {developerModeEnabled && (
        <ErrorBoundary>
          <Suspense fallback={<PanelSkeleton />}>
            <DeveloperPanel />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Settings Modal */}
      <Suspense fallback={<GlobalSpinner />}>
        <SettingsModal />
      </Suspense>
    </div>
  )
}

export function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  )
}

export default App

