import { Sidebar } from '@/features/sidebar/Sidebar'
import { Workspace } from '@/features/workspace/Workspace'
import { DeveloperPanel } from '@/features/developer-panel/DeveloperPanel'
import { ThemeProvider } from '@/app/ThemeProvider'
import { QueryProvider } from '@/app/QueryProvider'

function AppContent() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Center Workspace */}
      <Workspace />

      {/* Right Developer Panel */}
      <DeveloperPanel />
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
