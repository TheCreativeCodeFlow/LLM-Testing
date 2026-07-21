export type PromptCategory =
  | 'Concept Learning'
  | 'Problem Solving'
  | 'Hint Mode'
  | 'Debugging'
  | 'Interview Practice'
  | 'Code Review'
  | 'Saved Sessions'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  code?: string // optional code block associated with the message
}

export interface Exercise {
  id: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  description: string
  initialCode: string
  testCases: { input: string; expected: string; passed?: boolean }[]
}

export interface WorkspaceState {
  theme: 'light' | 'dark' | 'system'
  leftSidebarCollapsed: boolean
  rightPanelCollapsed: boolean
  activeCategory: PromptCategory
  activeConversationId: string | null
  conversations: Conversation[]
  searchQuery: string
  activeExercise: Exercise | null
  consoleLogs: string[]
  isGenerating: boolean
  draftPrompt?: string
  favoritePromptIds?: string[]
  customPrompts?: CustomPrompt[]
}
export interface Conversation {
  id: string
  title: string
  category: PromptCategory
  messages: Message[]
  pinned: boolean
  createdAt: number
  exerciseId?: string
}

export interface CustomPrompt {
  id: string
  title: string
  category: string
  content: string
  isCustom?: boolean
}
