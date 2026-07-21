import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, CheckCircle2, Bot, Send, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useWorkspaceStore } from '@/store/workspaceStore'

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
    addMessage,
    addConsoleLog,
  } = useWorkspaceStore()

  // Tabs: 'tests' | 'console' | 'ai'
  const [activeTab, setActiveTab] = useState<'tests' | 'console' | 'ai'>('tests')

  // Local chat input state
  const [chatInput, setChatInput] = useState('')
  const chatBottomRef = useRef<HTMLDivElement>(null)

  // Find active conversation
  const currentConversation = conversations.find((c) => c.id === activeConversationId)

  // Auto scroll chat to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentConversation?.messages])

  // Mock AI responses based on Category
  const getMockAIResponse = (category: string, userMsg: string): string => {
    const lowercaseMsg = userMsg.toLowerCase()
    if (category === 'Concept Learning') {
      if (lowercaseMsg.includes('time complexity') || lowercaseMsg.includes('big o')) {
        return '📚 **Big O Complexity**: The time complexity of solving Two Sum with a nested loop is O(N²). However, by using a Hash Map lookup store, we can scan the array once and get O(N) linear time complexity. Let me know if you would like me to detail the math!'
      }
      return `📚 **Concept Coach**: Welcome! We are currently in Concept Learning mode focusing on "${activeExercise?.title}". What specific data structure or complexity details would you like me to explain step-by-step?`
    }
    if (category === 'Problem Solving') {
      return `🛠️ **Problem Coach**: To solve "${activeExercise?.title}", think about mapping target offsets. If we know the sum is target, for each index value x, we just need to search if (target - x) is already present. A Map holds these in constant O(1) retrieval time.`
    }
    if (category === 'Hint Mode') {
      return `💡 **Hint**: Look closely at the Visualizer map on the left! It saves values we have already seen. If the complement is already in the map, you can immediately return the indices!`
    }
    if (category === 'Debugging') {
      return `🐛 **Debugger Helper**: Let's check for edge cases. Make sure to handle empty arrays, target values with no solutions, or negative numbers inside the inputs.`
    }
    if (category === 'Interview Practice') {
      return `💼 **Interview Coach**: In an interview, start by explaining the brute force O(N²) approach, then state: "We can optimize this to O(N) by trading space complexity using a Hash Map." This shows excellent analytical progression.`
    }
    return `🤖 **Tutor Coach**: I am analyzing your playground progress. Let me know if you need specific advice or optimization recommendations!`
  }

  // Handle sending chat message
  const handleSendMessage = () => {
    if (!chatInput.trim() || !activeConversationId) return
    const userText = chatInput.trim()
    setChatInput('')

    // Add user message
    addMessage(activeConversationId, {
      role: 'user',
      content: userText,
    })
    addConsoleLog('Sent message to AI Tutor.')

    // Simulate AI response delay
    setTimeout(() => {
      const responseText = getMockAIResponse(activeCategory, userText)
      addMessage(activeConversationId, {
        role: 'assistant',
        content: responseText,
      })
      addConsoleLog('Received feedback from AI Tutor.')
    }, 1000)
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
              setActiveTab('ai')
            }}
            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors ${
              activeTab === 'ai' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
            }`}
            title="AI Tutor"
          >
            <Bot size={16} />
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
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
              onClick={() => setActiveTab('ai')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-bold tracking-wide uppercase transition ${
                activeTab === 'ai'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <Bot size={12} />
              <span>AI Tutor</span>
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
                  <div className="flex-1 bg-black/40 border border-border/80 rounded-lg p-3 font-mono text-[10px] text-emerald-400 space-y-1 overflow-y-auto leading-[18px] min-h-[220px]">
                    {consoleLogs.map((log, idx) => (
                      <div key={idx} className="break-all">{log}</div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'ai' && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col h-full min-h-[250px]"
                >
                  {!activeConversationId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                      <Bot size={32} className="text-primary mb-2 animate-bounce" />
                      <p className="text-[11px] text-muted-foreground">
                        Create or select a Playground Session in the left sidebar to activate the AI Tutor.
                      </p>
                    </div>
                  ) : (
                    <div className="flex-grow flex flex-col h-full min-h-0">
                      {/* Messages list */}
                      <div className="flex-grow overflow-y-auto space-y-3 pr-1 mb-2 max-h-[calc(100vh-270px)]">
                        <div className="flex gap-2 rounded-lg bg-primary/5 border border-primary/10 p-3 text-[11px] leading-relaxed">
                          <Bot size={16} className="text-primary shrink-0 mt-0.5" />
                          <div>
                            <strong>AI tutor ({activeCategory})</strong>
                            <p className="mt-1">
                              Hi! We are working on <strong>{activeExercise?.title}</strong> in prompt mode{' '}
                              <strong>{activeCategory}</strong>. Ask me for hints or explain complexity analysis!
                            </p>
                          </div>
                        </div>

                        {currentConversation?.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex gap-2 rounded-lg border p-3 text-[11px] leading-relaxed ${
                              msg.role === 'user'
                                ? 'bg-secondary/20 border-border/50 ml-6'
                                : 'bg-primary/5 border-primary/10 mr-6'
                            }`}
                          >
                            {msg.role === 'assistant' ? (
                              <Bot size={16} className="text-primary shrink-0 mt-0.5" />
                            ) : (
                              <div className="h-4 w-4 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                                U
                              </div>
                            )}
                            <div>
                              <strong>{msg.role === 'assistant' ? 'AI Tutor' : 'You'}</strong>
                              <p className="mt-1 white-space-pre-wrap">{msg.content}</p>
                            </div>
                          </div>
                        ))}
                        <div ref={chatBottomRef} />
                      </div>

                      {/* Chat Input */}
                      <div className="flex gap-1.5 border-t border-border/60 pt-2.5 mt-auto">
                        <input
                          type="text"
                          placeholder={`Ask about ${activeCategory}...`}
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-grow rounded-lg border border-border bg-background/50 px-3 py-2 text-xs outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground/80"
                        />
                        <button
                          onClick={handleSendMessage}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-primary text-primary-foreground shadow hover:scale-105 active:scale-95 transition"
                          title="Send message"
                        >
                          <Send size={13} />
                        </button>
                      </div>
                    </div>
                  )}
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
