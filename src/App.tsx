import { Sidebar } from '@/features/sidebar/Sidebar'
import { Workspace } from '@/features/workspace/Workspace'
import { DeveloperPanel } from '@/features/developer-panel/DeveloperPanel'
import { ThemeProvider } from '@/app/ThemeProvider'
import { QueryProvider } from '@/app/QueryProvider'

import { useWorkspaceStore } from '@/store/workspaceStore'
import { SettingsModal } from '@/features/workspace/SettingsModal'

function AppContent() {
  const developerModeEnabled = useWorkspaceStore((state) => state.developerModeEnabled)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Center Workspace */}
      <Workspace />

      {/* Right Developer Panel */}
      {developerModeEnabled && <DeveloperPanel />}

      {/* Settings Modal */}
      <SettingsModal />
    </div>
  )
}

export function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </QueryProvider>
  )
}

export default App
