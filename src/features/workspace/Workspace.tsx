import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Code2,
  Sparkles,
  MessageSquare,
  Bot,
  BookOpen,
} from 'lucide-react'
import { useWorkspaceStore, defaultExercises } from '@/store/workspaceStore'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { PromptLibrary } from './PromptLibrary'

// Mock DSA Tutor full responses carrying Markdown, Code, Tables, and Math
const getTutorResponseText = (category: string, title: string, _userMsg: string): string => {
  
  if (category === 'Concept Learning') {
    return `Here is a complete conceptual overview of the **${title}** pattern.

### 📚 Algorithmic Concept
The core idea is to achieve optimal runtime by trading space complexity. Instead of doing nested scans, we store visited elements and index targets in a single-pass lookup.

### ⏱️ Time & Space Complexity Table
| Approach | Time Complexity | Space Complexity | Recommendation |
|:---|:---|:---|:---|
| Brute Force | $O(N^2)$ | $O(1)$ | Avoid in Production |
| Optimized HashMap | $O(N)$ | $O(N)$ | Highly Recommended |

### 📐 Mathematical Equality
For target $T$ and array index value $x$, we want to solve:
$$x + y = T \\implies y = T - x$$
Where $y$ represents the lookup complement.

### 💻 Production Reference Code
\`\`\`typescript
function solveProblem(nums: number[], target: number): number[] {
  // Hash map stores values and their index counterparts
  const store = new Map<number, number>();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (store.has(complement)) {
      return [store.get(complement)!, i];
    }
    store.set(nums[i], i);
  }
  return []; // default fallback
}
\`\`\`
Let me know what specific section you want to step through!`
  }

  if (category === 'Problem Solving') {
    return `Let's break down the step-by-step strategy to solve **${title}**:

1. **Understand Constraints**: Ask about empty arrays, duplicates, or negative targets.
2. **Formulate Complement**: For value $v$, search for $T - v$.
3. **Map Storage**: Save visited indices into a Map container.

Here is a quick look at how the map updates:
| Index scanned | Map state | Comparison | Match |
|:---|:---|:---|:---|
| 0 (val: 2) | \`{ 2: 0 }\` | $9 - 2 = 7$ (Not in map) | No |
| 1 (val: 7) | \`{ 2: 0, 7: 1 }\` | $9 - 7 = 2$ (Match found!) | Yes (index 0, 1) |`
  }

  if (category === 'Hint Mode') {
    return `💡 **Hint for ${title}**:
- Avoid using two loops ($O(N^2)$).
- Think about how to recall values you have *already* seen.
- Check out the mathematical balance: $Complement = Target - CurrentNode$.`
  }

  if (category === 'Debugging') {
    return `🐛 **Debugging Checklist**:
- **Index Out of Bounds**: Make sure you terminate iteration before array index boundaries.
- **Reference checking**: Verify node pointer references (\`node.next\`) are not null before dereferencing.
- **Memory footprint**: Ensure you do not allocate duplicate nested data structures inside your iterations.`
  }

  if (category === 'Interview Practice') {
    return `💼 **Interview Preparation Tips**:
- Clearly state the Brute Force complexity ($O(N^2)$) first.
- Ask the interviewer if the input is already sorted. (If it is sorted, a **Two-Pointer** scan achieves $O(1)$ space and $O(N)$ time!).
- Discuss space vs time trade-offs ($O(N)$ HashMap space is completely fine in high-throughput applications).`
  }

  if (category === 'Code Review') {
    return `🔍 **Code Review for ${title}**:
- **Formatting**: The code is well-structured and typed.
- **Safety**: Excellent use of TypeScript optional chaining.
- **Complexity**: Optimized linear scan $O(N)$ time complexity.`
  }

  return `🤖 **Tutor Coach**: I am ready to review your algorithm code or answer questions about **${title}**. What would you like to focus on next?`
}

export function Workspace() {
  const {
    activeExercise,
    setActiveExercise,
    activeConversationId,
    conversations,
    activeCategory,
    addMessage,
    editMessage,
    addConsoleLog,
    isGenerating,
    setIsGenerating,
  } = useWorkspaceStore()

  // Tab state: 'chat' | 'playground' | 'library'
  const [activeTab, setActiveTab] = useState<'chat' | 'playground' | 'library'>('chat')
  
  // Chat input states
  const [showSkeleton, setShowSkeleton] = useState(false)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  // Code editor states
  const [code, setCode] = useState(activeExercise?.initialCode || '')
  const [simStep, setSimStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const scrollAnchorRef = useRef<HTMLDivElement>(null)

  // Find current active conversation
  const currentConversation = conversations.find((c) => c.id === activeConversationId)

  // Sync code editor to active exercise
  useEffect(() => {
    if (activeExercise) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCode(activeExercise.initialCode)
      setSimStep(0)
      setIsPlaying(false)
    }
  }, [activeExercise])

  // Playback timer for visualizer
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

  // Smart auto-scroll implementation
  const handleChatScroll = () => {
    if (!chatContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
    setShouldAutoScroll(isAtBottom)
  }

  useEffect(() => {
    if (shouldAutoScroll && scrollAnchorRef.current) {
      scrollAnchorRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentConversation?.messages, showSkeleton, isGenerating, shouldAutoScroll])

  // Stop current streaming generation
  const handleStopGeneration = () => {
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current)
      streamTimerRef.current = null
    }
    setIsGenerating(false)
    setShowSkeleton(false)
    addConsoleLog('Streaming generation halted by user.')
  }

  // Streaming simulated responder logic
  const triggerStream = (textToSend: string, messageIdToReplace?: string) => {
    if (!activeConversationId) return

    setIsGenerating(true)
    setShowSkeleton(true)
    addConsoleLog(`Querying AI Tutor in prompt mode: "${activeCategory}"`)

    setTimeout(() => {
      setShowSkeleton(false)
      const fullReply = getTutorResponseText(activeCategory, activeExercise?.title || '', textToSend)
      
      // Let's create an empty message inside the list first, or reuse if editing
      let targetMessageId = messageIdToReplace
      
      if (!targetMessageId) {
        // Appending new empty assistant response
        addMessage(activeConversationId, {
          role: 'assistant',
          content: '',
        })
        // Fetch newly created message ID
        const currentConv = useWorkspaceStore.getState().conversations.find((c) => c.id === activeConversationId)
        if (currentConv && currentConv.messages.length > 0) {
          targetMessageId = currentConv.messages[currentConv.messages.length - 1].id
        }
      }

      if (!targetMessageId) {
        setIsGenerating(false)
        return
      }

      // Stream character by character
      let currentLength = 0
      const incrementSize = 3 // characters per tick for fluid look
      
      streamTimerRef.current = setInterval(() => {
        currentLength += incrementSize
        const partialContent = fullReply.substring(0, currentLength)
        
        editMessage(activeConversationId, targetMessageId!, partialContent)
        
        if (currentLength >= fullReply.length) {
          if (streamTimerRef.current) {
            clearInterval(streamTimerRef.current)
            streamTimerRef.current = null
          }
          setIsGenerating(false)
          addConsoleLog('AI Tutor response complete.')
        }
      }, 25)

    }, 1000)
  }

  // Handle sending new prompt
  const handleSendPromptText = (text: string) => {
    if (!text.trim() || isGenerating || !activeConversationId) return
    
    // Add user message
    addMessage(activeConversationId, {
      role: 'user',
      content: text,
    })

    triggerStream(text)
  }

  // Handle editing old prompt
  const handleEditPromptSubmit = (messageId: string, newContent: string) => {
    if (!activeConversationId || isGenerating) return
    
    // Edit the message which truncates the subsequent conversation history
    editMessage(activeConversationId, messageId, newContent)
    
    // Re-trigger the response stream
    triggerStream(newContent)
  }

  // Handle regenerating response
  const handleRegenerate = () => {
    if (!activeConversationId || isGenerating || !currentConversation || currentConversation.messages.length < 2) return

    // Find the last user message
    const messages = currentConversation.messages
    let lastUserIndex = -1
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserIndex = i
        break
      }
    }

    if (lastUserIndex === -1) return

    const lastUserText = messages[lastUserIndex].content
    
    // Truncate everything after this user message
    // We can do this by editing the user message to the same content (which has truncate logic inside store!)
    editMessage(activeConversationId, messages[lastUserIndex].id, lastUserText)

    triggerStream(lastUserText)
  }

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

  // Handle prompt library selection
  const handleSelectPromptFromLibrary = (promptText: string) => {
    const setDraftPrompt = useWorkspaceStore.getState().setDraftPrompt
    setDraftPrompt(promptText)
    setActiveTab('chat')
  }

  // Code editor lines
  const editorLineNumbers = Array.from({ length: 28 }, (_, i) => i + 1)

  return (
    <div className="flex-1 flex flex-col h-full bg-background select-none min-w-0">
      {/* Top Header Split Selector (Tutor Chat vs Code Playground vs Library) */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-border/60 bg-card/15">
        <div className="flex items-center gap-1.5 border border-border/80 bg-background/50 p-0.5 rounded-lg shadow-sm">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'chat'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <MessageSquare size={13} />
            <span>💬 Study Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('playground')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'playground'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <Code2 size={13} />
            <span>💻 Code Playground</span>
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'library'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <BookOpen size={13} />
            <span>📚 Prompt Library</span>
          </button>
        </div>

        {/* Action controllers matching active tab */}
        {activeTab === 'playground' ? (
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
        ) : activeTab === 'library' ? (
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-muted-foreground/60 tracking-wider bg-secondary/40 px-2 py-0.5 rounded uppercase">
              Tutor Prompts
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-muted-foreground/60 tracking-wider bg-secondary/40 px-2 py-0.5 rounded uppercase">
              Mode: {activeCategory}
            </span>
          </div>
        )}
      </div>

      {/* Main split area depending on active Tab */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col h-full bg-background"
            >
              {/* Chat messages viewport */}
              <div
                ref={chatContainerRef}
                onScroll={handleChatScroll}
                className="flex-grow overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-160px)]"
              >
                {!activeConversationId ? (
                  <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto space-y-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-lg shadow-primary/5">
                      <Bot size={24} className="animate-bounce" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-foreground">Select a Session</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Create or select a session from the sidebar on the left to begin talking with your AI Tutor.
                      </p>
                    </div>
                  </div>
                ) : currentConversation?.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-5">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Bot size={20} className="animate-pulse" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-bold text-foreground">Playground Session Initialized</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        This session is configured in **{activeCategory}** mode for **{activeExercise?.title}**.
                        Ask about constraints, step-by-step algorithms, or time complexities.
                      </p>
                    </div>
                    {/* Prompt Starters */}
                    <div className="grid grid-cols-2 gap-2 w-full pt-4">
                      {[
                        `Explain time complexity of ${activeExercise?.title}`,
                        `Give me a hint for ${activeExercise?.title}`,
                        `Review my code logic`,
                        `Explain Two Sum Hashmap`
                      ].map((starter, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            addConsoleLog(`Triggered prompt starter: "${starter}"`)
                            handleSendPromptText(starter)
                          }}
                          className="rounded-lg border border-border/80 bg-background/40 p-2.5 text-left text-[11px] hover:bg-accent/40 text-muted-foreground hover:text-foreground transition"
                        >
                          {starter}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-3xl mx-auto">
                    {currentConversation?.messages.map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        onEditSubmit={(newVal) => handleEditPromptSubmit(msg.id, newVal)}
                        onRegenerate={msg.role === 'assistant' && msg.id === currentConversation.messages[currentConversation.messages.length - 1].id ? handleRegenerate : undefined}
                        isGenerating={isGenerating}
                      />
                    ))}

                    {/* Loading skeleton */}
                    {showSkeleton && (
                      <div className="flex gap-4 p-4 rounded-xl border bg-card/30 border-border/40 max-w-[90%] animate-pulse">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground border-primary text-xs font-bold">
                          <Bot size={16} />
                        </div>
                        <div className="flex-1 space-y-2 py-1.5">
                          <div className="h-3 bg-muted rounded w-24" />
                          <div className="space-y-1">
                            <div className="h-2.5 bg-muted rounded w-full" />
                            <div className="h-2.5 bg-muted rounded w-5/6" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Typing Animation dots */}
                    {isGenerating && !showSkeleton && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 italic pl-12 font-medium">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" />
                        <span className="flex h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce delay-100" />
                        <span className="flex h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce delay-200" />
                        <span className="pl-1">Tutor is writing...</span>
                      </div>
                    )}
                  </div>
                )}
                <div ref={scrollAnchorRef} />
              </div>

              {/* Chat Input Dock */}
              {activeConversationId && (
                <div className="p-3 border-t border-border/50 bg-background/25">
                  <ChatInput
                    onSubmit={handleSendPromptText}
                    onStop={handleStopGeneration}
                    isGenerating={isGenerating}
                    placeholder={`Ask me anything about ${activeCategory}...`}
                  />
                </div>
              )}
            </motion.div>
          ) : activeTab === 'library' ? (
            <motion.div
              key="library"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 overflow-y-auto p-4 bg-background"
            >
              <PromptLibrary onSelectPrompt={handleSelectPromptFromLibrary} />
            </motion.div>
          ) : (
            // Playground Code Editor + Visualizer split view (Same as before)
            <motion.div
              key="playground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col md:flex-row min-h-0"
            >
              {/* Left Side: Code Editor */}
              <div className="flex-1 flex flex-col border-r border-border/50 bg-[#090d16] text-[#e2e8f0] font-mono text-xs overflow-hidden">
                <div className="flex items-center justify-between bg-card/10 px-4 py-2 border-b border-border/30 text-[10px] text-muted-foreground tracking-wide font-sans">
                  <span>index.ts</span>
                  <span>TypeScript (Node 19)</span>
                </div>

                <div className="flex-1 flex overflow-y-auto">
                  <div className="w-10 select-none text-right pr-3.5 py-3 border-r border-border/10 text-muted-foreground/40 bg-background/5">
                    {editorLineNumbers.map((line) => (
                      <div key={line} className="h-[19px] leading-[19px] text-[11px]">{line}</div>
                    ))}
                  </div>
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
                  <span className="flex items-center gap-1 font-bold">
                    <Sparkles size={11} className="text-primary animate-pulse" /> Algorithmic Sandbox Visualizer
                  </span>
                  <span>Step {simStep}</span>
                </div>

                <div className="flex-1 flex items-center justify-center min-h-[220px] bg-gradient-to-br from-indigo-500/[0.02] to-violet-500/[0.02]">
                  {activeExercise?.id === 'two-sum' ? (
                    <div className="flex flex-col items-center justify-center h-full w-full p-4 space-y-6">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Array Inputs</span>
                        <div className="flex gap-2">
                          {[2, 7, 11, 15].map((num, idx) => {
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
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full w-full p-4 space-y-6">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">List Nodes (Visual representation)</span>
                        <div className="flex flex-wrap items-center gap-2 justify-center">
                          {[1, 2, 3, 4, 5].map((node, idx) => {
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
                                {idx < 4 && (
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
                  )}
                </div>

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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
export default Workspace
