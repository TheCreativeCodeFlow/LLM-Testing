import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Heart,
  Copy,
  Plus,
  Sparkles,
  BookOpen,
  Tag,
  Check,
  Share2,
} from 'lucide-react'
import { useWorkspaceStore } from '@/store/workspaceStore'
import type { CustomPrompt } from '@/types'

const LIBRARY_CATEGORIES = [
  'All',
  'Favorites',
  'Custom Collections',
  'Arrays',
  'Strings',
  'Linked Lists',
  'Trees',
  'Graphs',
  'Greedy',
  'DP',
  'Binary Search',
  'Sliding Window',
  'Backtracking',
  'Interview',
  'Debugging',
  'Code Review',
]

const PREDEFINED_PROMPTS: CustomPrompt[] = [
  // Arrays
  { id: 'arr-1', category: 'Arrays', title: 'Two Sum Hash Map Analysis', content: 'Explain step-by-step how a Hash Map optimizes the brute force Two Sum solution from O(N^2) to O(N) time complexity.' },
  { id: 'arr-2', category: 'Arrays', title: 'Kadane\'s Algorithm Max Subarray', content: 'Explain Kadane\'s algorithm for finding the maximum subarray sum, and prove why a greedy local check is correct.' },
  // Strings
  { id: 'str-1', category: 'Strings', title: 'Anagram Sorting vs Frequency count', content: 'Compare sorting words O(N log N) vs using a frequency bucket O(N) to check if two strings are anagrams.' },
  { id: 'str-2', category: 'Strings', title: 'String Palindrome Two Pointers', content: 'Provide a clean O(1) space two-pointer approach to check if a string is a palindrome, ignoring non-alphanumeric characters.' },
  // Linked Lists
  { id: 'list-1', category: 'Linked Lists', title: 'Reverse a Singly Linked List', content: 'Walk through the pointer assignments to reverse a singly linked list iteratively, and sketch out recursive node links.' },
  { id: 'list-2', category: 'Linked Lists', title: 'Floyd\'s Cycle Finding Algorithm', content: 'Explain Floyd\'s cycle-finding (tortoise and hare) algorithm. Prove why fast and slow pointers are guaranteed to meet if a cycle exists.' },
  // Trees
  { id: 'tree-1', category: 'Trees', title: 'DFS vs BFS recursion overhead', content: 'Contrast Depth First Search (DFS) stack depth space requirements with Breadth First Search (BFS) queue length in a balanced tree.' },
  { id: 'tree-2', category: 'Trees', title: 'Binary Search Tree Validation', content: 'Explain why checking node.left.val < node.val and node.right.val > node.val recursively is insufficient to validate a BST, and show the correct boundary approach.' },
  // Graphs
  { id: 'graph-1', category: 'Graphs', title: 'Dijkstra\'s Shortest Path', content: 'Describe Dijkstra\'s shortest path algorithm step-by-step using a min-priority queue, and explain its time complexity bounds.' },
  { id: 'graph-2', category: 'Graphs', title: 'Topological Sort DFS vs Kahn\'s', content: 'Contrast topological sorting of a Directed Acyclic Graph (DAG) using Post-order DFS vs Kahn\'s indegree queue algorithm.' },
  // Greedy
  { id: 'greedy-1', category: 'Greedy', title: 'Greedy Choice Property', content: 'What mathematical properties (like optimal substructure and greedy choice) make a problem solvable via a Greedy approach rather than Dynamic Programming?' },
  // DP
  { id: 'dp-1', category: 'DP', title: 'DP Memoization vs Tabulation', content: 'Compare top-down memoization (recursion) vs bottom-up tabulation (iteration) for dynamic programming. Discuss space optimizations.' },
  { id: 'dp-2', category: 'DP', title: '0/1 Knapsack State Transition', content: 'Formulate the recurrence relation for the 0/1 Knapsack problem. Draw the grid state representation and explain space reduction to O(W).' },
  // Binary Search
  { id: 'bs-1', category: 'Binary Search', title: 'Avoid Integer Overflow', content: 'Explain why `mid = (low + high) / 2` can overflow in programming languages, and show how `low + (high - low) / 2` prevents it.' },
  { id: 'bs-2', category: 'Binary Search', title: 'Search in Rotated Sorted Array', content: 'Explain how to determine which half of a rotated sorted array is sorted to perform binary search in O(log N) time.' },
  // Sliding Window
  { id: 'sw-1', category: 'Sliding Window', title: 'Variable-Size Window Template', content: 'Provide a general template for variable-size sliding windows (e.g. longest substring without repeating characters), explaining when to shrink the left boundary.' },
  // Backtracking
  { id: 'back-1', category: 'Backtracking', title: 'Recursion Unwinding', content: 'Explain how backtracking works at a stack frame level when searching for all subsets or permutations. How do we undo/backtrack state?' },
  // Interview
  { id: 'int-1', category: 'Interview', title: 'Clarifying Questions checklist', content: 'List 5 clarifying questions I should ask the interviewer about data constraints, input sizes, memory limits, and target outcomes before writing a single line of code.' },
  // Debugging
  { id: 'deb-1', category: 'Debugging', title: 'Stack Overflow In DFS', content: 'How do I debug and resolve a stack overflow recursion error in my deep DFS graph traversal on large inputs.' },
  // Code Review
  { id: 'rev-1', category: 'Code Review', title: 'Review Quicksort worst-case', content: 'Analyze this quicksort implementation with a static pivot index (0). Explain why it degrades to O(N^2) on sorted arrays and suggest random pivot optimizations.' }
]

interface PromptLibraryProps {
  onSelectPrompt: (promptText: string) => void
}

export function PromptLibrary({ onSelectPrompt }: PromptLibraryProps) {
  const {
    favoritePromptIds = [],
    customPrompts = [],
    toggleFavoritePrompt,
    addCustomPrompt,
    addConsoleLog,
  } = useWorkspaceStore()

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  // Custom prompt builder state
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Arrays')
  const [newContent, setNewContent] = useState('')
  const [formError, setFormError] = useState('')

  // Merge predefined prompts with user-created prompts
  const allPrompts = [...PREDEFINED_PROMPTS, ...customPrompts]

  // Filter prompts
  const filteredPrompts = allPrompts.filter((prompt) => {
    // Search query filter
    const matchesSearch =
      prompt.title.toLowerCase().includes(search.toLowerCase()) ||
      prompt.content.toLowerCase().includes(search.toLowerCase()) ||
      prompt.category.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    // Category filter
    if (selectedCategory === 'All') return true
    if (selectedCategory === 'Favorites') return favoritePromptIds.includes(prompt.id)
    if (selectedCategory === 'Custom Collections') return prompt.isCustom
    return prompt.category === selectedCategory
  })

  // Handle copying prompt text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
      addConsoleLog(`Copied prompt template to clipboard: "${text.substring(0, 30)}..."`)
    })
  }

  // Handle saving custom prompt
  const handleSaveCustomPrompt = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!newTitle.trim() || !newContent.trim()) {
      setFormError('Please fill in both title and prompt content.')
      return
    }

    const newPrompt: CustomPrompt = {
      id: `custom-${crypto.randomUUID()}`,
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      isCustom: true,
    }

    addCustomPrompt(newPrompt)
    addConsoleLog(`[Library] Custom prompt added: "${newPrompt.title}" under ${newPrompt.category}`)
    
    // reset form
    setNewTitle('')
    setNewContent('')
    setShowAddForm(false)
  }

  return (
    <div className="flex flex-col h-full space-y-4 max-w-4xl mx-auto p-1 font-sans">
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
            <BookOpen size={16} className="text-primary animate-pulse" />
            <span>Interactive Prompt Library</span>
          </h2>
          <p className="text-[10px] text-muted-foreground font-medium">
            Browse and use optimized DSA tutor templates, manage custom prompts, and save your favorites.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 cursor-pointer bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-all active:scale-95"
        >
          <Plus size={12} />
          <span>{showAddForm ? 'Cancel' : 'Create Custom'}</span>
        </button>
      </div>

      {/* Add Custom Prompt Form Panel */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSaveCustomPrompt}
            className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-md p-4 space-y-3 overflow-hidden shadow-lg"
          >
            <div className="text-[11px] font-bold text-foreground flex items-center gap-1 border-b border-border/20 pb-1.5">
              <Sparkles size={12} className="text-primary" />
              <span>Create Custom Prompt Template</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Prompt Title</label>
                <input
                  type="text"
                  placeholder="e.g. DFS recursion limit explanation"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-lg border border-border/80 bg-background/50 px-3 py-2 text-xs outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-lg border border-border/80 bg-background/50 px-3 py-2 text-xs outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/20"
                >
                  {LIBRARY_CATEGORIES.slice(3).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Prompt Body Content</label>
              <textarea
                rows={3}
                placeholder="Type the full prompt instruction here..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full rounded-lg border border-border/80 bg-background/50 px-3 py-2 text-xs outline-none resize-none focus:border-primary/80 focus:ring-1 focus:ring-primary/20 font-mono"
              />
            </div>

            {formError && <p className="text-[10px] text-destructive font-semibold">{formError}</p>}

            <div className="flex justify-end gap-2 pt-1 border-t border-border/20">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-lg border border-border px-3 py-1.5 text-[10px] font-semibold hover:bg-accent transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-primary text-primary-foreground px-4 py-1.5 text-[10px] font-bold shadow hover:scale-[1.02] active:scale-95 transition"
              >
                Save Prompt
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
        <input
          type="text"
          placeholder="Search prompt titles, categories, or description templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border/80 bg-background/45 pl-10 pr-4 py-2.5 text-xs outline-none focus:border-primary/80 focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/80 shadow-inner"
        />
      </div>

      {/* Category selector chips row (scrollable) */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent select-none whitespace-nowrap">
        {LIBRARY_CATEGORIES.map((category) => {
          const isActive = selectedCategory === category
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-lg cursor-pointer px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider border transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-102'
                  : 'bg-background/40 text-muted-foreground border-border/80 hover:bg-accent hover:text-foreground'
              }`}
            >
              {category === 'Favorites' && '❤️ '}
              {category === 'Custom Collections' && '📦 '}
              {category}
            </button>
          )
        })}
      </div>

      {/* Grid of prompts */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 select-text">
        {filteredPrompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border/80 rounded-xl bg-background/20 space-y-2">
            <BookOpen size={24} className="text-muted-foreground/40 animate-pulse" />
            <p className="text-xs text-muted-foreground font-semibold">No prompts found matching current criteria.</p>
            <span className="text-[10px] text-muted-foreground/60">Try choosing another category chip or expanding the search terms.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-6">
            {filteredPrompts.map((prompt) => {
              const isFav = favoritePromptIds.includes(prompt.id)
              return (
                <motion.div
                  key={prompt.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border border-border/80 bg-card/65 hover:border-border hover:bg-card hover:shadow-md transition-all duration-300 p-3.5 flex flex-col justify-between gap-3 group relative overflow-hidden"
                >
                  <div className="space-y-1.5 min-w-0">
                    {/* Header: Category & Action icons */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 tracking-wider uppercase">
                        <Tag size={8} />
                        <span>{prompt.category}</span>
                        {prompt.isCustom && <span className="text-amber-500 font-bold ml-1">📦 CUSTOM</span>}
                      </span>
                      
                      <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopy(prompt.id, prompt.content)}
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition"
                          title="Copy prompt"
                        >
                          {copiedId === prompt.id ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                        </button>
                        <button
                          onClick={() => toggleFavoritePrompt(prompt.id)}
                          className="p-1 rounded hover:bg-muted cursor-pointer transition"
                          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart size={11} className={isFav ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground hover:text-rose-500'} />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition duration-300 truncate">
                      {prompt.title}
                    </h3>
                    
                    {/* Description preview */}
                    <p className="text-[10px] text-muted-foreground/90 font-medium leading-relaxed line-clamp-3 select-all">
                      {prompt.content}
                    </p>
                  </div>

                  {/* Footer Use button */}
                  <button
                    onClick={() => {
                      onSelectPrompt(prompt.content)
                      addConsoleLog(`[Library] Selected prompt: "${prompt.title}". Loaded in study workspace.`)
                    }}
                    className="w-full flex items-center justify-center gap-1 cursor-pointer bg-secondary/80 hover:bg-primary text-secondary-foreground hover:text-primary-foreground border border-border/60 hover:border-primary text-[10px] font-bold py-1.5 rounded-lg shadow-sm transition-all duration-300 group-hover:scale-101 active:scale-98"
                  >
                    <Share2 size={11} />
                    <span>Load Prompt into Chat</span>
                  </button>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
export default PromptLibrary
