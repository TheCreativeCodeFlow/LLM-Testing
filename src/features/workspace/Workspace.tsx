import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, RotateCcw, ChevronRight, ChevronLeft, Code2, Sparkles } from 'lucide-react'
import { useWorkspaceStore, defaultExercises } from '@/store/workspaceStore'

export function Workspace() {
  const { activeExercise, setActiveExercise, addConsoleLog } = useWorkspaceStore()
  
  // Local code state
  const [code, setCode] = useState(activeExercise?.initialCode || '')
  
  // Simulation Step-by-Step state
  const [simStep, setSimStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Update code when exercise changes
  useEffect(() => {
    if (activeExercise) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCode(activeExercise.initialCode)
      setSimStep(0)
      setIsPlaying(false)
    }
  }, [activeExercise])

  // Simple automated playing intervals for simulation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    if (isPlaying) {
      interval = setInterval(() => {
        setSimStep((prev) => {
          const maxSteps = activeExercise?.id === 'two-sum' ? 3 : 5
          if (prev >= maxSteps) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 1500)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, activeExercise])

  // Run Code logic
  const handleRunCode = () => {
    addConsoleLog(`Compiling code for exercise: "${activeExercise?.title}"...`)
    setTimeout(() => {
      addConsoleLog('Running test cases...')
      addConsoleLog('✓ Test Case 1: Success!')
      addConsoleLog('✓ Test Case 2: Success!')
      addConsoleLog('🎉 All test cases passed successfully!')
    }, 800)
  }

  // Reset Code logic
  const handleResetCode = () => {
    if (activeExercise) {
      setCode(activeExercise.initialCode)
      setSimStep(0)
      setIsPlaying(false)
      addConsoleLog(`Code reset for exercise: "${activeExercise.title}"`)
    }
  }

  // Render Visualizer steps for Array Two Sum
  const renderTwoSumVisuals = () => {
    const nums = [2, 7, 11, 15]
    // step index explanations:
    // Step 0: Start
    // Step 1: i = 0 (val = 2), map = {}
    // Step 2: i = 1 (val = 7), map = {2: 0} -> found target 9!
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-4 space-y-6">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Array Inputs</span>
          <div className="flex gap-2">
            {nums.map((num, idx) => {
              let bg = 'bg-secondary/40 border-border/80 text-foreground'
              let scale = 1.0
              if (simStep === 1 && idx === 0) {
                bg = 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/20'
                scale = 1.05
              } else if (simStep >= 2 && (idx === 0 || idx === 1)) {
                bg = 'bg-emerald-500/25 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/20'
                scale = 1.08
              }
              return (
                <motion.div
                  key={idx}
                  layout
                  animate={{ scale }}
                  className={`flex flex-col items-center justify-center h-12 w-12 rounded-lg border text-sm font-bold shadow-sm transition-colors duration-300 ${bg}`}
                >
                  <span>{num}</span>
                  <span className="text-[9px] font-normal text-muted-foreground/80 mt-0.5">[{idx}]</span>
                </motion.div>
              )
            })}
          </div>
        </div>

        <div className="w-full max-w-sm rounded-xl border border-border/60 bg-background/30 p-3 space-y-2.5">
          <div className="flex items-center justify-between text-xs border-b border-border/40 pb-2">
            <span className="font-semibold text-muted-foreground flex items-center gap-1">🗄️ HashTable Store</span>
            <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-mono">Map&lt;value, index&gt;</span>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[30px] items-center justify-center">
            {simStep === 0 && <span className="text-[11px] text-muted-foreground/70 italic">Map is empty</span>}
            {simStep >= 1 && (
              <div className="flex items-center gap-1 text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-md">
                <span>"2"</span>
                <span className="text-muted-foreground font-normal">→</span>
                <span>0</span>
              </div>
            )}
            {simStep >= 2 && (
              <div className="flex items-center gap-1 text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-md">
                <span>"7"</span>
                <span className="text-muted-foreground font-normal">→</span>
                <span>1</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-center max-w-md px-4">
          <p className="text-xs text-foreground font-medium transition-all duration-300">
            {simStep === 0 && '💡 Press "Next Step" to begin walking through the Two Sum hash-map solution.'}
            {simStep === 1 && '🔍 Step 1: Checking index 0 (val = 2). Complement 9 - 2 = 7 is NOT in the hashmap. Adding 2 to our map.'}
            {simStep === 2 && '🎉 Step 2: Checking index 1 (val = 7). Complement 9 - 7 = 2 IS in the hashmap! Match found at index 0.'}
            {simStep >= 3 && '🏁 Simulation complete. Returns [0, 1] matching target sum 9.'}
          </p>
        </div>
      </div>
    )
  }

  // Render Visualizer steps for Linked List Reverse
  const renderLinkedListVisuals = () => {
    const list = [1, 2, 3, 4, 5]
    // step index representations:
    // Step 0: 1 -> 2 -> 3 -> 4 -> 5 -> null
    // Step 1: null <- 1  2 -> 3 -> 4 -> 5 -> null
    // Step 2: null <- 1 <- 2  3 -> 4 -> 5 -> null
    // Step 3: null <- 1 <- 2 <- 3  4 -> 5 -> null
    // Step 4: null <- 1 <- 2 <- 3 <- 4  5 -> null
    // Step 5: null <- 1 <- 2 <- 3 <- 4 <- 5 (Done)
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-4 space-y-6">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">List Nodes (Visual representation)</span>
          <div className="flex flex-wrap items-center gap-2 justify-center">
            {list.map((node, idx) => {
              // Deciding directional pointer arrow
              const isReversed = idx < simStep
              const isCurrent = idx === simStep
              
              let borderStyle = 'border-border/80 bg-secondary/40 text-foreground'
              if (isCurrent) {
                borderStyle = 'border-amber-500 bg-amber-500/25 text-amber-300 ring-2 ring-amber-500/20'
              } else if (isReversed) {
                borderStyle = 'border-indigo-500 bg-indigo-500/20 text-indigo-400'
              }

              return (
                <div key={idx} className="flex items-center">
                  <motion.div
                    layout
                    className={`flex flex-col items-center justify-center h-10 w-10 rounded-full border text-xs font-bold shadow-sm ${borderStyle}`}
                  >
                    {node}
                  </motion.div>
                  {idx < list.length - 1 && (
                    <span className="text-muted-foreground/80 font-mono text-sm px-1.5">
                      {isReversed ? '←' : '→'}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="text-center max-w-md px-4">
          <p className="text-xs text-foreground font-medium transition-all duration-300">
            {simStep === 0 && '💡 Initial State: A singly-linked list 1 → 2 → 3 → 4 → 5. Head starts at node 1.'}
            {simStep === 1 && '🔄 Step 1: Reversing node 1. Set curr.next to prev (null). Node 1 pointer now points backwards to null.'}
            {simStep === 2 && '🔄 Step 2: Reversing node 2. Set curr.next to prev (1). Node 2 pointer points back to 1.'}
            {simStep === 3 && '🔄 Step 3: Reversing node 3. Set curr.next to prev (2). Node 3 pointer points back to 2.'}
            {simStep === 4 && '🔄 Step 4: Reversing node 4. Set curr.next to prev (3). Node 4 pointer points back to 3.'}
            {simStep >= 5 && '🏁 Step 5: Reversing node 5. Head is now set to 5. Output reversed list: 5 → 4 → 3 → 2 → 1.'}
          </p>
        </div>
      </div>
    )
  }

  // Row numbers for simulated code editor
  const editorLineNumbers = Array.from({ length: 28 }, (_, i) => i + 1)

  return (
    <div className="flex-1 flex flex-col h-full bg-background select-none min-w-0">
      {/* Top Header Workspace */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-border/60 bg-card/15">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
            <Code2 size={16} className="text-primary" />
            <span>{activeExercise?.title || 'Sandbox Editor'}</span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
            activeExercise?.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' :
            activeExercise?.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
            'bg-rose-500/10 text-rose-500'
          }`}>
            {activeExercise?.difficulty}
          </span>
        </div>

        {/* Exercises dropdown wrapper selector */}
        <div className="flex items-center gap-2">
          <select
            value={activeExercise?.id}
            onChange={(e) => {
              const matched = defaultExercises.find((ex) => ex.id === e.target.value)
              if (matched) setActiveExercise(matched)
            }}
            className="rounded-lg border border-border bg-card/65 px-2.5 py-1.5 text-xs text-foreground font-medium outline-none cursor-pointer"
          >
            {defaultExercises.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.title}</option>
            ))}
          </select>

          <button
            onClick={handleResetCode}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition"
            title="Reset Code"
          >
            <RotateCcw size={13} />
          </button>
          
          <button
            onClick={handleRunCode}
            className="flex items-center gap-1.5 cursor-pointer bg-primary text-primary-foreground font-semibold text-xs px-3.5 py-1.5 rounded-lg shadow-sm hover:scale-[1.01] active:scale-95 transition"
          >
            <Play size={11} fill="currentColor" />
            <span>Run Code</span>
          </button>
        </div>
      </div>

      {/* Editor & Visualizer Main Split Area */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        
        {/* Left Side: Code Editor Mock */}
        <div className="flex-1 flex flex-col border-r border-border/50 bg-[#090d16] text-[#e2e8f0] font-mono text-xs overflow-hidden">
          <div className="flex items-center justify-between bg-card/10 px-4 py-2 border-b border-border/30 text-[10px] text-muted-foreground tracking-wide font-sans">
            <span>index.ts</span>
            <span>TypeScript (Node 19)</span>
          </div>

          <div className="flex-1 flex overflow-y-auto">
            {/* Gutter Line Numbers */}
            <div className="w-10 select-none text-right pr-3.5 py-3 border-r border-border/10 text-muted-foreground/40 bg-background/5">
              {editorLineNumbers.map((line) => (
                <div key={line} className="h-[19px] leading-[19px] text-[11px]">{line}</div>
              ))}
            </div>

            {/* Simulated Editor Input */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 resize-none bg-transparent px-4 py-3 leading-[19px] text-xs text-slate-100 outline-none border-none font-mono focus:ring-0"
              spellCheck="false"
            />
          </div>
        </div>

        {/* Right Side: DSA Steps Visualizer */}
        <div className="flex-1 flex flex-col bg-background/25">
          <div className="flex items-center justify-between px-4 py-2 bg-card/5 border-b border-border/30 text-[10px] text-muted-foreground tracking-wide">
            <span className="flex items-center gap-1 font-bold"><Sparkles size={11} className="text-primary animate-pulse" /> Algorithmic Sandbox Visualizer</span>
            <span>Step {simStep}</span>
          </div>

          {/* Canvas representation */}
          <div className="flex-1 flex items-center justify-center min-h-[220px] bg-gradient-to-br from-indigo-500/[0.02] to-violet-500/[0.02]">
            <AnimatePresence mode="wait">
              {activeExercise?.id === 'two-sum' ? renderTwoSumVisuals() : renderLinkedListVisuals()}
            </AnimatePresence>
          </div>

          {/* Stepper controller footer */}
          <div className="p-3 border-t border-border/60 bg-card/15 flex items-center justify-between">
            <button
              onClick={() => setSimStep((prev) => Math.max(0, prev - 1))}
              disabled={simStep === 0}
              className="flex items-center gap-1 cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs text-foreground font-semibold hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={13} />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSimStep(0)
                  setIsPlaying(false)
                  addConsoleLog('Simulation reset.')
                }}
                className="text-xs text-muted-foreground font-semibold hover:text-foreground cursor-pointer"
              >
                Reset Visuals
              </button>
              <button
                onClick={() => setIsPlaying((p) => !p)}
                className="bg-primary/10 text-primary border border-primary/20 text-xs px-3.5 py-1.5 rounded-lg font-bold hover:bg-primary/20 cursor-pointer transition"
              >
                {isPlaying ? 'Pause Sim' : 'Play Walkthrough'}
              </button>
            </div>

            <button
              onClick={() => {
                const max = activeExercise?.id === 'two-sum' ? 3 : 5
                setSimStep((prev) => Math.min(max, prev + 1))
              }}
              disabled={simStep >= (activeExercise?.id === 'two-sum' ? 3 : 5)}
              className="flex items-center gap-1 cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs text-foreground font-semibold hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <span>Next</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
export default Workspace
