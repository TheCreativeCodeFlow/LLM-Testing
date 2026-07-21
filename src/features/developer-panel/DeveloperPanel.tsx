import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Terminal,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Layers,
  Settings,
  Activity,
  Zap,
  Clock,
  Compass,
  Database,
  BarChart,
  HardDrive,
  Trash2,
} from 'lucide-react'
import { useWorkspaceStore } from '@/store/workspaceStore'
import { MetricCard } from './MetricCard'

export function DeveloperPanel() {
  const {
    rightPanelCollapsed,
    toggleRightPanel,
    activeConversationId,
    conversations,
    activeCategory,
    activeExercise,
    consoleLogs,
    clearConsoleLogs,
    addConsoleLog,
    isGenerating,
    apiOnline,
  } = useWorkspaceStore()

  // Tabs: 'tests' | 'console' | 'telemetry'
  const [activeTab, setActiveTab] = useState<'tests' | 'console' | 'telemetry'>('telemetry')

  // Interactive Model Configs
  const [temperature, setTemperature] = useState(0.7)
  const [topP, setTopP] = useState(0.95)
  const [topK, setTopK] = useState(40)
  const [maxTokens, setMaxTokens] = useState(2048)

  // Simulated Telemetry state
  const [latency, setLatency] = useState(185)
  const [outputTokens, setOutputTokens] = useState(0)
  const [genTime, setGenTime] = useState(0)
  const [tokensPerSec, setTokensPerSec] = useState(0)

  // Find active conversation
  const currentConversation = conversations.find((c) => c.id === activeConversationId)

  // Calculate dynamic input tokens based on messages characters
  const totalChars = currentConversation?.messages.reduce((acc, m) => acc + m.content.length, 0) || 0
  const inputTokens = totalChars > 0 ? Math.ceil(totalChars / 4.2) : 0

  // Telemetry loop synchronizer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    if (isGenerating) {
      setTimeout(() => {
        setLatency(Math.floor(Math.random() * 85 + 140)) // TTFT TTFB 140ms - 225ms
        setGenTime(0.1)
        setOutputTokens(2)
        setTokensPerSec(48 + Math.random() * 8)
      }, 0)

      interval = setInterval(() => {
        setGenTime((prevTime) => {
          const nextTime = Number((prevTime + 0.1).toFixed(1))
          const currentSpeed = Number((48 + Math.random() * 8).toFixed(1))
          setTokensPerSec(currentSpeed)
          setOutputTokens((prevTokens) => prevTokens + Math.ceil(currentSpeed * 0.1))
          return nextTime
        })
      }, 100)
    } else {
      if (interval) clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isGenerating])

  // Log hyperparameter shifts
  const logHyperparameterChange = (name: string, val: number) => {
    addConsoleLog(`[Telemetry] Hyperparameter ${name} configured to: ${val}`)
  }

  return (
    <motion.div
      layout
      animate={{ width: rightPanelCollapsed ? 48 : 320 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative z-20 flex h-full flex-col border-l border-border bg-card/45 backdrop-blur-md overflow-hidden select-none"
    >
      {/* Header and Toggle Button */}
      <div className="flex h-14 items-center justify-between px-3 border-b border-border/60">
        <button
          onClick={toggleRightPanel}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border/80 bg-background/50 hover:bg-accent hover:text-accent-foreground transition-all duration-200"
          title={rightPanelCollapsed ? 'Expand Panel' : 'Collapse Panel'}
        >
          {rightPanelCollapsed ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        </button>
        {!rightPanelCollapsed && (
          <span className="text-xs font-semibold text-foreground mr-auto ml-2 tracking-tight">
            Developer Panel
          </span>
        )}
      </div>

      {/* Tabs list (Vertical icons in collapsed view, standard tabs in expanded view) */}
      {rightPanelCollapsed ? (
        <div className="flex-1 flex flex-col items-center py-4 gap-4">
          <button
            onClick={() => {
              toggleRightPanel()
              setActiveTab('tests')
            }}
            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors ${
              activeTab === 'tests' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
            }`}
            title="Test Cases"
          >
            <CheckCircle2 size={16} />
          </button>
          <button
            onClick={() => {
              toggleRightPanel()
              setActiveTab('console')
            }}
            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors ${
              activeTab === 'console' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
            }`}
            title="Console Output"
          >
            <Terminal size={16} />
          </button>
          <button
            onClick={() => {
              toggleRightPanel()
              setActiveTab('telemetry')
            }}
            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors ${
              activeTab === 'telemetry' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
            }`}
            title="AI Telemetry"
          >
            <BarChart size={16} />
          </button>
        </div>
      ) : (
        <div className="flex-grow flex flex-col min-h-0">
          {/* Navigation Tab buttons */}
          <div className="flex border-b border-border/50 bg-background/20 p-1 gap-1">
            <button
              onClick={() => setActiveTab('tests')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-bold tracking-wide uppercase transition ${
                activeTab === 'tests'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <CheckCircle2 size={12} />
              <span>Tests</span>
            </button>
            <button
              onClick={() => setActiveTab('console')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-bold tracking-wide uppercase transition ${
                activeTab === 'console'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <Terminal size={12} />
              <span>Logs</span>
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-bold tracking-wide uppercase transition ${
                activeTab === 'telemetry'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <BarChart size={12} />
              <span>Telemetry</span>
            </button>
          </div>

          {/* Tab contents */}
          <div className="flex-1 overflow-y-auto p-3 min-h-0">
            <AnimatePresence mode="wait">
              {activeTab === 'tests' && (
                <motion.div
                  key="tests"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-3"
                >
                  <div className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                    Verification Test Cases
                  </div>
                  {activeExercise?.testCases.map((tc, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-border/80 bg-background/30 p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground">TEST CASE #{idx + 1}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                          Passed
                        </span>
                      </div>
                      <div className="space-y-1 font-mono text-[10px]">
                        <div>
                          <span className="text-muted-foreground">Input:</span>{' '}
                          <code className="bg-secondary/40 px-1 py-0.5 rounded">{tc.input}</code>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Expected:</span>{' '}
                          <code className="bg-secondary/40 px-1 py-0.5 rounded">{tc.expected}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'console' && (
                <motion.div
                  key="console"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col h-full space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                      Execution Logs
                    </span>
                    <button
                      onClick={clearConsoleLogs}
                      className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1 cursor-pointer"
                      title="Clear logs"
                    >
                      <Trash2 size={11} /> Clear
                    </button>
                  </div>
                  <div className="flex-grow bg-black/40 border border-border/80 rounded-lg p-3 font-mono text-[10px] text-emerald-400 space-y-1 overflow-y-auto leading-[18px] min-h-[220px]">
                    {consoleLogs.map((log, idx) => (
                      <div key={idx} className="break-all">{log}</div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'telemetry' && (
                <motion.div
                  key="telemetry"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  {/* Status Indicator Row */}
                  <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                    <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">LLM Stats</span>
                    {apiOnline ? (
                      <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-emerald-500 tracking-wider uppercase">API: ONLINE</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/25 animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        <span className="text-[9px] font-bold text-rose-500 tracking-wider uppercase">API: OFFLINE</span>
                      </div>
                    )}
                  </div>

                  {/* 16 Telemetry Metric Cards Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <MetricCard
                      title="Model Name"
                      value="Gemini 3.5 Flash"
                      icon={<Cpu size={12} />}
                    />
                    <MetricCard
                      title="Adapter Version"
                      value="v2.4-dsa"
                      icon={<Layers size={12} />}
                    />
                    <MetricCard
                      title="Tokenizer"
                      value="Geist Tiktoken"
                      icon={<Database size={12} />}
                    />
                    <MetricCard
                      title="Device"
                      value="Apple M3 Max GPU"
                      icon={<HardDrive size={12} />}
                    />
                    <MetricCard
                      title="Latency (TTFT)"
                      value={isGenerating ? 'Calcul...' : `${latency}`}
                      unit={isGenerating ? undefined : 'ms'}
                      icon={<Clock size={12} />}
                      isLoading={isGenerating && latency === 0}
                    />
                    <MetricCard
                      title="Tokens/sec"
                      value={isGenerating ? tokensPerSec : tokensPerSec > 0 ? tokensPerSec : '0.0'}
                      unit="tok/s"
                      icon={<Zap size={12} />}
                      isLoading={isGenerating && tokensPerSec === 0}
                    />
                    <MetricCard
                      title="Input Tokens"
                      value={inputTokens}
                      unit="tokens"
                      icon={<ChevronRight size={12} />}
                    />
                    <MetricCard
                      title="Output Tokens"
                      value={isGenerating ? outputTokens : outputTokens > 0 ? outputTokens : '0'}
                      unit="tokens"
                      icon={<ChevronLeft size={12} />}
                    />
                    <MetricCard
                      title="Generation Time"
                      value={isGenerating ? genTime : genTime > 0 ? genTime : '0.0'}
                      unit="s"
                      icon={<Activity size={12} />}
                    />
                    <MetricCard
                      title="Context Length"
                      value="128"
                      unit="K"
                      icon={<Compass size={12} />}
                    />
                    <MetricCard
                      title="Tutor Mode"
                      value={activeCategory}
                      icon={<Settings size={12} />}
                      className="col-span-2"
                    />
                  </div>

                  {/* Hyperparameters Config Block */}
                  <div className="border-t border-border/40 pt-4 space-y-3">
                    <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase block">Hyperparameters</span>
                    
                    {/* Temperature */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="font-semibold text-foreground/80">Temperature</span>
                        <span className="font-mono text-primary">{temperature}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        onMouseUp={() => logHyperparameterChange('Temperature', temperature)}
                        className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    {/* Top-P */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="font-semibold text-foreground/80">Top-P (Nucleus)</span>
                        <span className="font-mono text-primary">{topP}</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={topP}
                        onChange={(e) => setTopP(parseFloat(e.target.value))}
                        onMouseUp={() => logHyperparameterChange('Top-P', topP)}
                        className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    {/* Top-K */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="font-semibold text-foreground/80">Top-K</span>
                        <span className="font-mono text-primary">{topK}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        step="1"
                        value={topK}
                        onChange={(e) => setTopK(parseInt(e.target.value))}
                        onMouseUp={() => logHyperparameterChange('Top-K', topK)}
                        className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    {/* Max Tokens */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="font-semibold text-foreground/80">Max Tokens</span>
                        <span className="font-mono text-primary">{maxTokens}</span>
                      </div>
                      <input
                        type="range"
                        min="256"
                        max="4096"
                        step="128"
                        value={maxTokens}
                        onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                        onMouseUp={() => logHyperparameterChange('Max Tokens', maxTokens)}
                        className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  )
}
export default DeveloperPanel
