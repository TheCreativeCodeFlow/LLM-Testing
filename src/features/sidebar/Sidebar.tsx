import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Code2,
  Lightbulb,
  Bug,
  Briefcase,
  CheckSquare,
  FolderHeart,
  Plus,
  Search,
  Pin,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Edit2,
  Sparkles,
  Settings,
} from 'lucide-react'
import { useWorkspaceStore } from '@/store/workspaceStore'
import type { PromptCategory, Conversation } from '@/types'
import { ContextMenu } from './ContextMenu'

const CATEGORIES: {
  name: PromptCategory
  icon: React.ComponentType<{ size?: number; className?: string }>
  color: string
}[] = [
  { name: 'Concept Learning', icon: BookOpen, color: 'text-indigo-400' },
  { name: 'Problem Solving', icon: Code2, color: 'text-emerald-400' },
  { name: 'Hint Mode', icon: Lightbulb, color: 'text-amber-400' },
  { name: 'Debugging', icon: Bug, color: 'text-rose-400' },
  { name: 'Interview Practice', icon: Briefcase, color: 'text-blue-400' },
  { name: 'Code Review', icon: CheckSquare, color: 'text-violet-400' },
  { name: 'Saved Sessions', icon: FolderHeart, color: 'text-pink-400' },
]

export function Sidebar() {
  const {
    theme,
    setTheme,
    leftSidebarCollapsed,
    toggleLeftSidebar,
    activeCategory,
    setActiveCategory,
    activeConversationId,
    setActiveConversationId,
    conversations,
    searchQuery,
    setSearchQuery,
    createConversation,
    deleteConversation,
    togglePinConversation,
    renameConversation,
    addConsoleLog,
  } = useWorkspaceStore()

  // Local state for Context Menu
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    convId: string
  } | null>(null)

  // Local state for Renaming Session
  const [renameId, setRenameId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)

  // Active keyboard navigation index
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const matchesCategory = c.category === activeCategory
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Separate pinned vs recent
  const pinnedConvs = filteredConversations.filter((c) => c.pinned)
  const recentConvs = filteredConversations.filter((c) => !c.pinned)
  const allDisplayConvs = [...pinnedConvs, ...recentConvs]

  // Focus rename input when activated
  useEffect(() => {
    if (renameId && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renameId])

  // Handle right-click for Context Menu
  const handleContextMenu = (e: React.MouseEvent, convId: string) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      convId,
    })
  }

  // Handle renaming action
  const handleRenameSubmit = (id: string) => {
    if (renameValue.trim()) {
      renameConversation(id, renameValue.trim())
      addConsoleLog(`Session renamed to "${renameValue.trim()}"`)
    }
    setRenameId(null)
  }

  // Keyboard navigation within session history
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (leftSidebarCollapsed || allDisplayConvs.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex((prev) => (prev < allDisplayConvs.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : allDisplayConvs.length - 1))
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault()
      setActiveConversationId(allDisplayConvs[focusedIndex].id)
      addConsoleLog(`Navigated to session: "${allDisplayConvs[focusedIndex].title}"`)
    }
  }

  return (
    <motion.aside
      layout
      animate={{ width: leftSidebarCollapsed ? 64 : 290 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="relative z-20 flex h-full flex-col border-r border-border bg-card/45 backdrop-blur-md outline-none select-none"
      role="complementary"
      aria-label="Sidebar navigation"
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-3 border-b border-border/60">
        {!leftSidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 font-semibold text-sm tracking-tight text-foreground"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <Sparkles size={15} className="animate-pulse" />
            </div>
            <span>DSA Tutor Playground</span>
          </motion.div>
        )}
        <button
          onClick={toggleLeftSidebar}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border/80 bg-background/50 hover:bg-accent hover:text-accent-foreground transition-all duration-200 ml-auto"
          aria-label={leftSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={leftSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {leftSidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* New Session action button */}
      <div className="p-3">
        {leftSidebarCollapsed ? (
          <button
            aria-label="New chat"
            onClick={() => {
              const newId = createConversation(activeCategory)
              addConsoleLog(`Created new session: ${activeCategory}`)
              setActiveConversationId(newId)
            }}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/10 hover:shadow-primary/25 hover:scale-105 active:scale-95 transition-all duration-200"
            title="New Chat"
          >
            <Plus size={18} />
          </button>
        ) : (
          <button
            aria-label="New chat"
            onClick={() => {
              const newId = createConversation(activeCategory)
              addConsoleLog(`Created new session: ${activeCategory}`)
              setActiveConversationId(newId)
            }}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/10 hover:shadow-primary/25 hover:scale-[1.01] active:scale-95 transition-all duration-200"
          >
            <Plus size={14} />
            <span>New Chat</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      {!leftSidebarCollapsed && (
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              aria-label="Search conversations"
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border/80 bg-background/30 py-2.5 pr-3 pl-8 text-xs outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/40 transition-all duration-200 placeholder:text-muted-foreground/80"
            />
          </div>
        </div>
      )}

      {/* Prompt Categories */}
      <div className="flex flex-col gap-0.5 px-2 py-1.5 border-b border-border/50">
        <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
          {!leftSidebarCollapsed ? 'Prompt Categories' : 'CAT'}
        </div>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const isActive = activeCategory === cat.name
          return (
            <button
              key={cat.name}
              aria-label={`Switch prompt category to ${cat.name}`}
              onClick={() => {
                setActiveCategory(cat.name)
                setFocusedIndex(-1)
                addConsoleLog(`Switched prompt mode to: ${cat.name}`)
              }}
              className={`flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-xs font-medium cursor-pointer transition-all duration-150 ${
                isActive
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
              }`}
              title={cat.name}
            >
              <Icon size={16} className={`${isActive ? 'text-primary' : cat.color} shrink-0`} />
              {!leftSidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="truncate"
                >
                  {cat.name}
                </motion.span>
              )}
            </button>
          )
        })}
      </div>

      {/* Session History & Persisted List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
          {!leftSidebarCollapsed ? 'Conversation History' : 'HIST'}
        </div>

        {allDisplayConvs.length === 0 ? (
          <div className="px-2 text-[11px] text-muted-foreground/75 italic">
            {!leftSidebarCollapsed ? 'No active sessions here.' : 'Ø'}
          </div>
        ) : (
          <div className="space-y-1">
            {/* Pinned Sessions */}
            {pinnedConvs.length > 0 && !leftSidebarCollapsed && (
              <div className="pb-2 space-y-1">
                <div className="px-2 text-[9px] font-bold text-muted-foreground/60 flex items-center gap-1">
                  <Pin size={8} /> PINNED SESSIONS
                </div>
                {pinnedConvs.map((conv, idx) => (
                  <HistoryItem
                    key={conv.id}
                    conv={conv}
                    index={idx}
                    isActive={activeConversationId === conv.id}
                    isFocused={focusedIndex === idx}
                    renameId={renameId}
                    renameValue={renameValue}
                    setRenameValue={setRenameValue}
                    renameInputRef={renameInputRef}
                    onRenameSubmit={handleRenameSubmit}
                    onRenameCancel={() => setRenameId(null)}
                    onSelect={() => setActiveConversationId(conv.id)}
                    onContextMenu={(e) => handleContextMenu(e, conv.id)}
                    setRenameId={setRenameId}
                  />
                ))}
              </div>
            )}

            {/* Recent/Unpinned Sessions */}
            {!leftSidebarCollapsed && recentConvs.map((conv, idx) => {
              const actualIdx = pinnedConvs.length + idx
              return (
                <HistoryItem
                  key={conv.id}
                  conv={conv}
                  index={actualIdx}
                  isActive={activeConversationId === conv.id}
                  isFocused={focusedIndex === actualIdx}
                  renameId={renameId}
                  renameValue={renameValue}
                  setRenameValue={setRenameValue}
                  renameInputRef={renameInputRef}
                  onRenameSubmit={handleRenameSubmit}
                  onRenameCancel={() => setRenameId(null)}
                  onSelect={() => setActiveConversationId(conv.id)}
                  onContextMenu={(e) => handleContextMenu(e, conv.id)}
                  setRenameId={setRenameId}
                />
              )
            })}

            {/* Minimal icons representation in collapsed view */}
            {leftSidebarCollapsed &&
              allDisplayConvs.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-xs font-semibold border transition-all duration-150 ${
                    activeConversationId === conv.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background/20 text-muted-foreground border-border hover:bg-accent'
                  }`}
                  title={conv.title}
                >
                  {conv.pinned ? '📌' : conv.title.substring(0, 2).toUpperCase()}
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Footer Profile & Theme Toggle */}
      <div className="p-3 border-t border-border/50 bg-background/25 flex items-center justify-between gap-2">
        {!leftSidebarCollapsed ? (
          <>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
                U
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-foreground">Playground Dev</span>
                <span className="text-[9px] text-muted-foreground">Premium Account</span>
              </div>
            </div>
            <div className="flex items-center gap-0.5 rounded-lg border border-border/80 bg-background/50 p-0.5 shadow-sm">
              <button
                onClick={() => useWorkspaceStore.getState().setSettingsModalOpen(true)}
                className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-150"
                title="Settings"
              >
                <Settings size={11} />
              </button>
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTheme(t)
                    addConsoleLog(`Theme switched to: ${t}`)
                  }}
                  className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded-md transition-all duration-150 ${
                    theme === t
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                  title={`Switch to ${t} mode`}
                >
                  {t === 'light' && <Sun size={11} />}
                  {t === 'dark' && <Moon size={11} />}
                  {t === 'system' && <Monitor size={11} />}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-2 mx-auto">
            <button
              onClick={() => useWorkspaceStore.getState().setSettingsModalOpen(true)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-background/50 text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
              title="Workspace Settings"
            >
              <Settings size={14} />
            </button>
            <button
              onClick={() => {
                const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark'
                setTheme(nextTheme)
                addConsoleLog(`Theme toggled to: ${nextTheme}`)
              }}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-background/50 text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
              title={`Current theme: ${theme}. Click to cycle.`}
            >
              {theme === 'light' && <Sun size={14} />}
              {theme === 'dark' && <Moon size={14} />}
              {theme === 'system' && <Monitor size={14} />}
            </button>
          </div>
        )}
      </div>

      {/* Context Menu Trigger */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isPinned={conversations.find((c) => c.id === contextMenu.convId)?.pinned || false}
          onClose={() => setContextMenu(null)}
          onDelete={() => {
            deleteConversation(contextMenu.convId)
            addConsoleLog(`Deleted playground session.`)
          }}
          onRename={() => {
            const conv = conversations.find((c) => c.id === contextMenu.convId)
            if (conv) {
              setRenameId(conv.id)
              setRenameValue(conv.title)
            }
          }}
          onTogglePin={() => {
            togglePinConversation(contextMenu.convId)
            const wasPinned = conversations.find((c) => c.id === contextMenu.convId)?.pinned
            addConsoleLog(`Session ${wasPinned ? 'unpinned' : 'pinned'}.`)
          }}
        />
      )}
    </motion.aside>
  )
}

interface HistoryItemProps {
  conv: Conversation
  index: number
  isActive: boolean
  isFocused: boolean
  renameId: string | null
  renameValue: string
  setRenameValue: (val: string) => void
  renameInputRef: React.RefObject<HTMLInputElement | null>
  onRenameSubmit: (id: string) => void
  onRenameCancel: () => void
  onSelect: () => void
  onContextMenu: (e: React.MouseEvent) => void
  setRenameId: (id: string) => void
}

function HistoryItem({
  conv,
  isActive,
  isFocused,
  renameId,
  renameValue,
  setRenameValue,
  renameInputRef,
  onRenameSubmit,
  onRenameCancel,
  onSelect,
  onContextMenu,
  setRenameId,
}: HistoryItemProps) {
  const isRenaming = renameId === conv.id

  return (
    <div
      onClick={onSelect}
      onContextMenu={onContextMenu}
      className={`group relative flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer transition-all duration-150 border outline-none select-none ${
        isActive
          ? 'bg-accent/80 text-foreground border-border/80 shadow-sm'
          : isFocused
          ? 'bg-accent/40 text-foreground border-border/40'
          : 'bg-transparent text-muted-foreground border-transparent hover:bg-accent/20 hover:text-foreground'
      }`}
    >
      {isRenaming ? (
        <input
          ref={renameInputRef}
          type="text"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onRenameSubmit(conv.id)
            } else if (e.key === 'Escape') {
              onRenameCancel()
            }
          }}
          onBlur={() => onRenameSubmit(conv.id)}
          className="w-full bg-background border border-primary px-1.5 py-0.5 rounded text-xs text-foreground outline-none"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <>
          <span className="truncate pr-4">{conv.title}</span>
          <div className="absolute right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {conv.pinned && <Pin size={10} className="text-primary rotate-45" />}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setRenameId(conv.id)
                setRenameValue(conv.title)
              }}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              title="Rename Session"
            >
              <Edit2 size={10} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
