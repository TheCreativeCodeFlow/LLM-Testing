import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Settings,
  Cpu,
  Keyboard,
  Database,
  Trash2,
  Download,
  Upload,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react'
import { useWorkspaceStore } from '@/store/workspaceStore'

const SETTINGS_SECTIONS = [
  { id: 'general', label: 'General Settings', icon: <Settings size={13} /> },
  { id: 'model', label: 'Model Parameters', icon: <Cpu size={13} /> },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: <Keyboard size={13} /> },
  { id: 'backup', label: 'Backups & Reset', icon: <Database size={13} /> },
]

export function SettingsModal() {
  const {
    theme = 'dark',
    setTheme,
    settingsModalOpen = false,
    setSettingsModalOpen,
    backendUrl = 'http://localhost:8000',
    setBackendUrl,
    apiTimeout = 10000,
    setApiTimeout,
    streamingEnabled = true,
    setStreamingEnabled,
    shortcutsEnabled = true,
    setShortcutsEnabled,
    developerModeEnabled = true,
    setDeveloperModeEnabled,
    temperature = 0.7,
    setTemperature,
    topP = 0.95,
    setTopP,
    topK = 40,
    setTopK,
    maxTokens = 2048,
    setMaxTokens,
    resetToDefaults,
    importSettingsAndConversations,
    addConsoleLog,
    addToast,
    conversations = [],
    favoritePromptIds = [],
    customPrompts = [],
  } = useWorkspaceStore()

  const [activeSection, setActiveSection] = useState('general')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!settingsModalOpen) return null

  // Handle Export configuration/chats
  const handleExportData = () => {
    const backupObj = {
      theme,
      backendUrl,
      apiTimeout,
      streamingEnabled,
      shortcutsEnabled,
      developerModeEnabled,
      temperature,
      topP,
      topK,
      maxTokens,
      conversations,
      favoritePromptIds,
      customPrompts,
    }

    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObj, null, 2))
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', dataStr)
      downloadAnchor.setAttribute('download', `dsa_tutor_backup_${Date.now()}.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()

      addConsoleLog('[Library] Workspace data backup exported.')
      addToast('Backup downloaded successfully.', 'success', 3000)
    } catch {
      addToast('Failed to export backup file.', 'error', 3000)
    }
  }

  // Handle Import configuration/chats
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.readAsText(file, 'UTF-8')
    reader.onload = (event) => {
      const text = event.target?.result as string
      const success = importSettingsAndConversations(text)

      if (success) {
        addConsoleLog('[Library] Workspace backup data imported successfully.')
        addToast('Data backup restored successfully!', 'success', 3000)
        setSettingsModalOpen(false)
      } else {
        addToast('Failed to restore data: invalid backup format.', 'error', 4000)
      }
    }
    e.target.value = '' // reset
  }

  // Handle Reset Defaults
  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to reset all settings, conversations, and custom prompts? This cannot be undone.')) {
      resetToDefaults()
      setTheme('system')
      addToast('Workspace restored to factory defaults.', 'success', 3000)
      setSettingsModalOpen(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in-30 duration-200">
        {/* Modal Main container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="bg-card border border-border/80 rounded-2xl w-full max-w-2xl h-[420px] flex overflow-hidden shadow-2xl relative select-none"
        >
          {/* Close button */}
          <button
            onClick={() => setSettingsModalOpen(false)}
            className="absolute top-3.5 right-3.5 p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer transition"
          >
            <X size={14} />
          </button>

          {/* Left Navigation bar */}
          <div className="w-[180px] border-r border-border/60 bg-secondary/25 p-3 flex flex-col gap-1 pt-10">
            {SETTINGS_SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-extrabold shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  {sec.icon}
                  <span>{sec.label}</span>
                </button>
              )
            })}
          </div>

          {/* Right Contents pane */}
          <div className="flex-1 p-6 pt-10 overflow-y-auto select-text">
            {/* General section */}
            {activeSection === 'general' && (
              <div className="space-y-4 font-sans text-xs">
                <h3 className="text-sm font-bold text-foreground mb-4">General Settings</h3>

                {/* Theme Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Interface Theme</label>
                  <div className="flex items-center gap-1 bg-background/50 border border-border/80 p-0.5 rounded-lg w-fit">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition cursor-pointer ${
                        theme === 'light' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Sun size={11} />
                      <span>Light</span>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition cursor-pointer ${
                        theme === 'dark' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Moon size={11} />
                      <span>Dark</span>
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition cursor-pointer ${
                        theme === 'system' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Monitor size={11} />
                      <span>System</span>
                    </button>
                  </div>
                </div>

                {/* Backend URL input */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">FastAPI Backend URL</label>
                  <input
                    type="text"
                    value={backendUrl}
                    onChange={(e) => setBackendUrl(e.target.value)}
                    placeholder="http://localhost:8000"
                    className="w-full max-w-sm rounded-lg border border-border/80 bg-background/50 px-3 py-2 text-xs outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                {/* API Timeout */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">API Timeout (ms)</label>
                  <input
                    type="number"
                    value={apiTimeout}
                    onChange={(e) => setApiTimeout(parseInt(e.target.value) || 10000)}
                    className="w-32 rounded-lg border border-border/80 bg-background/50 px-3 py-2 text-xs outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>
            )}

            {/* Model Params section */}
            {activeSection === 'model' && (
              <div className="space-y-4 font-sans text-xs">
                <h3 className="text-sm font-bold text-foreground mb-4">Model Parameters</h3>

                {/* Temperature */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-bold text-foreground/80">Temperature</span>
                    <span className="font-mono text-primary font-bold">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* Top-P */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-bold text-foreground/80">Top-P (Nucleus Sampling)</span>
                    <span className="font-mono text-primary font-bold">{topP}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={topP}
                    onChange={(e) => setTopP(parseFloat(e.target.value))}
                    className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* Top-K */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-bold text-foreground/80">Top-K</span>
                    <span className="font-mono text-primary font-bold">{topK}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={topK}
                    onChange={(e) => setTopK(parseInt(e.target.value))}
                    className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* Max Tokens */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-bold text-foreground/80">Max Generation Tokens</span>
                    <span className="font-mono text-primary font-bold">{maxTokens}</span>
                  </div>
                  <input
                    type="range"
                    min="256"
                    max="4096"
                    step="128"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
            )}

            {/* Keyboard Shortcuts section */}
            {activeSection === 'shortcuts' && (
              <div className="space-y-4 font-sans text-xs">
                <h3 className="text-sm font-bold text-foreground mb-4">Shortcuts & Streaming</h3>

                {/* Response Streaming Toggle */}
                <div className="flex items-center justify-between border-b border-border/20 pb-3">
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground/90">Enable Streaming Responses</span>
                    <p className="text-[9px] text-muted-foreground leading-normal">
                      Display LLM responses chunk-by-chunk in real time.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={streamingEnabled}
                    onChange={(e) => setStreamingEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-border bg-background cursor-pointer accent-primary text-primary-foreground"
                  />
                </div>

                {/* Shortcuts Enabled Toggle */}
                <div className="flex items-center justify-between border-b border-border/20 pb-3">
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground/90">Enable Keyboard Shortcuts</span>
                    <p className="text-[9px] text-muted-foreground leading-normal">
                      Enable text-editor hotkeys inside the prompt input.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={shortcutsEnabled}
                    onChange={(e) => setShortcutsEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-border bg-background cursor-pointer accent-primary text-primary-foreground"
                  />
                </div>

                {/* Developer Mode Toggle */}
                <div className="flex items-center justify-between border-b border-border/20 pb-3">
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground/90">Developer Telemetry Panel</span>
                    <p className="text-[9px] text-muted-foreground leading-normal">
                      Display the right-hand telemetry metrics and case verification panel.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={developerModeEnabled}
                    onChange={(e) => setDeveloperModeEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-border bg-background cursor-pointer accent-primary text-primary-foreground"
                  />
                </div>

                {/* Shortcuts List table */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Shortcuts Sheet</span>
                  <div className="border border-border/80 bg-background/25 rounded-lg p-2.5 font-mono text-[9px] leading-relaxed space-y-1 text-foreground/90">
                    <div className="flex justify-between"><span className="text-muted-foreground font-semibold">Send prompt</span> <span>Enter</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground font-semibold">Force send</span> <span>Ctrl/Cmd + Enter</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground font-semibold">Insert newline</span> <span>Shift + Enter</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* Backups & Actions section */}
            {activeSection === 'backup' && (
              <div className="space-y-4 font-sans text-xs">
                <h3 className="text-sm font-bold text-foreground mb-4">Backups & Recovery Actions</h3>

                {/* JSON Export */}
                <div className="flex items-center justify-between border-b border-border/20 pb-3.5">
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground/90">Export Workspace Data</span>
                    <p className="text-[9px] text-muted-foreground leading-normal">
                      Download settings, conversations, and custom prompts as a JSON file.
                    </p>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="flex items-center gap-1 bg-primary text-primary-foreground font-bold text-[9px] px-3.5 py-2 rounded-lg shadow hover:scale-102 transition cursor-pointer"
                  >
                    <Download size={11} />
                    <span>Export</span>
                  </button>
                </div>

                {/* JSON Import */}
                <div className="flex items-center justify-between border-b border-border/20 pb-3.5">
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground/90">Import Workspace Backup</span>
                    <p className="text-[9px] text-muted-foreground leading-normal">
                      Restore layout settings and prompt history from a JSON backup file.
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1 bg-secondary text-secondary-foreground font-bold border border-border/80 text-[9px] px-3.5 py-2 rounded-lg hover:bg-accent transition cursor-pointer"
                    >
                      <Upload size={11} />
                      <span>Upload</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleImportData}
                      accept=".json"
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Factory Reset */}
                <div className="flex items-center justify-between pb-2">
                  <div className="space-y-0.5">
                    <span className="font-bold text-rose-500">Reset to Factory Defaults</span>
                    <p className="text-[9px] text-muted-foreground leading-normal">
                      Clear conversations history, preferences, and reset the store.
                    </p>
                  </div>
                  <button
                    onClick={handleResetDefaults}
                    className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 font-bold text-[9px] px-3.5 py-2 rounded-lg shadow transition cursor-pointer"
                  >
                    <Trash2 size={11} />
                    <span>Reset All</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
export default SettingsModal
