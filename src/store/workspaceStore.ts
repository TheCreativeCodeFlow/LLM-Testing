import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WorkspaceState, Conversation, Message, PromptCategory, Exercise, CustomPrompt, Toast } from '@/types'

interface WorkspaceActions {
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  toggleLeftSidebar: () => void
  toggleRightPanel: () => void
  setActiveCategory: (category: PromptCategory) => void
  setActiveConversationId: (id: string | null) => void
  setSearchQuery: (query: string) => void
  setActiveExercise: (exercise: Exercise | null) => void
  createConversation: (category: PromptCategory, title?: string) => string
  deleteConversation: (id: string) => void
  togglePinConversation: (id: string) => void
  renameConversation: (id: string, title: string) => void
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => void
  clearConsoleLogs: () => void
  addConsoleLog: (log: string) => void
  setIsGenerating: (isGenerating: boolean) => void
  editMessage: (conversationId: string, messageId: string, newContent: string) => void
  setDraftPrompt: (val: string) => void
  toggleFavoritePrompt: (id: string) => void
  addCustomPrompt: (prompt: CustomPrompt) => void
  setApiOnline: (online: boolean) => void
  addToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error', duration?: number) => void
  removeToast: (id: string) => void
  setBackendUrl: (val: string) => void
  setApiTimeout: (val: number) => void
  setStreamingEnabled: (val: boolean) => void
  setShortcutsEnabled: (val: boolean) => void
  setDeveloperModeEnabled: (val: boolean) => void
  setTemperature: (val: number) => void
  setTopP: (val: number) => void
  setTopK: (val: number) => void
  setMaxTokens: (val: number) => void
  setSettingsModalOpen: (val: boolean) => void
  resetToDefaults: () => void
  importSettingsAndConversations: (data: string) => boolean
}

export type WorkspaceStore = WorkspaceState & WorkspaceActions

export const defaultExercises: Exercise[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    initialCode: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    testCases: [
      { input: 'nums = [2,7,11,15], target = 9', expected: '[0, 1]' },
      { input: 'nums = [3,2,4], target = 6', expected: '[1, 2]' }
    ]
  },
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    description: 'Given the head of a singly linked list, reverse the list, and return its reversed list.',
    initialCode: `class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val?: number, next?: ListNode | null) {
    this.val = (val===undefined ? 0 : val)
    this.next = (next===undefined ? null : next)
  }
}

function reverseList(head: ListNode | null): ListNode | null {
  let prev = null;
  let curr = head;
  while (curr !== null) {
    let nextTemp = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nextTemp;
  }
  return prev;
}`,
    testCases: [
      { input: 'head = [1,2,3,4,5]', expected: '[5,4,3,2,1]' }
    ]
  }
]

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      // State
      theme: 'dark',
      leftSidebarCollapsed: false,
      rightPanelCollapsed: false,
      activeCategory: 'Concept Learning',
      activeConversationId: null,
      conversations: [],
      searchQuery: '',
      activeExercise: defaultExercises[0],
      consoleLogs: ['[System] Workspace initialized. Dark mode active.'],
      isGenerating: false,
      draftPrompt: '',
      favoritePromptIds: [],
      customPrompts: [],
      apiOnline: false,
      toasts: [],
      backendUrl: 'http://localhost:8000',
      apiTimeout: 10000,
      streamingEnabled: true,
      shortcutsEnabled: true,
      developerModeEnabled: true,
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxTokens: 2048,
      settingsModalOpen: false,

      // Actions
      setTheme: (theme) => set({ theme }),
      toggleLeftSidebar: () => set((state) => ({ leftSidebarCollapsed: !state.leftSidebarCollapsed })),
      toggleRightPanel: () => set((state) => ({ rightPanelCollapsed: !state.rightPanelCollapsed })),
      setActiveCategory: (activeCategory) => set({ activeCategory }),
      setActiveConversationId: (activeConversationId) => set({ activeConversationId }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setActiveExercise: (activeExercise) => set({ activeExercise }),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      
      createConversation: (category, title) => {
        const id = crypto.randomUUID()
        const newConv: Conversation = {
          id,
          title: title || `New ${category} Session`,
          category,
          messages: [],
          pinned: false,
          createdAt: Date.now()
        }
        set((state) => ({
          conversations: [newConv, ...state.conversations],
          activeConversationId: id,
          activeCategory: category
        }))
        return id
      },

      deleteConversation: (id) => set((state) => {
        const newConversations = state.conversations.filter((c) => c.id !== id)
        let newActiveId = state.activeConversationId
        if (state.activeConversationId === id) {
          const categoryConvs = newConversations.filter((c) => c.category === state.activeCategory)
          newActiveId = categoryConvs.length > 0 ? categoryConvs[0].id : null
        }
        return {
          conversations: newConversations,
          activeConversationId: newActiveId
        }
      }),

      togglePinConversation: (id) => set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === id ? { ...c, pinned: !c.pinned } : c
        )
      })),

      renameConversation: (id, title) => set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === id ? { ...c, title } : c
        )
      })),

      addMessage: (conversationId, message) => set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    ...message,
                    id: crypto.randomUUID(),
                    timestamp: Date.now()
                  }
                ]
              }
            : c
        )
      })),

      clearConsoleLogs: () => set({ consoleLogs: [] }),
      addConsoleLog: (log) => set((state) => ({
        consoleLogs: [...state.consoleLogs, `[${new Date().toLocaleTimeString()}] ${log}`]
      })),

      editMessage: (conversationId, messageId, newContent) => set((state) => ({
        conversations: state.conversations.map((c) => {
          if (c.id !== conversationId) return c
          const msgIdx = c.messages.findIndex((m) => m.id === messageId)
          if (msgIdx === -1) return c
          
          // Truncate subsequent messages and update message content
          const updatedMessages = c.messages.slice(0, msgIdx + 1)
          updatedMessages[msgIdx] = {
            ...updatedMessages[msgIdx],
            content: newContent,
            timestamp: Date.now()
          }
          return {
            ...c,
            messages: updatedMessages
          }
        })
      })),

      setDraftPrompt: (draftPrompt) => set({ draftPrompt }),

      toggleFavoritePrompt: (id) => set((state) => {
        const favs = state.favoritePromptIds || []
        const nextFavs = favs.includes(id)
          ? favs.filter((fId) => fId !== id)
          : [...favs, id]
        return { favoritePromptIds: nextFavs }
      }),

      addCustomPrompt: (prompt) => set((state) => ({
        customPrompts: [...(state.customPrompts || []), prompt]
      })),

      setApiOnline: (apiOnline) => set({ apiOnline }),

      addToast: (message, type = 'info', duration = 4000) => set((state) => {
        const id = crypto.randomUUID()
        const newToast: Toast = { id, message, type, duration }
        return { toasts: [...(state.toasts || []), newToast] }
      }),

      removeToast: (id) => set((state) => ({
        toasts: (state.toasts || []).filter((t) => t.id !== id)
      })),

      setBackendUrl: (backendUrl) => set({ backendUrl }),
      setApiTimeout: (apiTimeout) => set({ apiTimeout }),
      setStreamingEnabled: (streamingEnabled) => set({ streamingEnabled }),
      setShortcutsEnabled: (shortcutsEnabled) => set({ shortcutsEnabled }),
      setDeveloperModeEnabled: (developerModeEnabled) => set({ developerModeEnabled }),
      setTemperature: (temperature) => set({ temperature }),
      setTopP: (topP) => set({ topP }),
      setTopK: (topK) => set({ topK }),
      setMaxTokens: (maxTokens) => set({ maxTokens }),
      setSettingsModalOpen: (settingsModalOpen) => set({ settingsModalOpen }),

      resetToDefaults: () => set({
        theme: 'dark',
        leftSidebarCollapsed: false,
        rightPanelCollapsed: false,
        activeCategory: 'Concept Learning',
        activeConversationId: null,
        conversations: [],
        searchQuery: '',
        activeExercise: defaultExercises[0],
        consoleLogs: ['[System] Workspace reset to defaults.'],
        isGenerating: false,
        draftPrompt: '',
        favoritePromptIds: [],
        customPrompts: [],
        backendUrl: 'http://localhost:8000',
        apiTimeout: 10000,
        streamingEnabled: true,
        shortcutsEnabled: true,
        developerModeEnabled: true,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxTokens: 2048,
        settingsModalOpen: false,
      }),

      importSettingsAndConversations: (dataStr) => {
        try {
          const parsed = JSON.parse(dataStr)
          if (parsed && typeof parsed === 'object') {
            set((state) => ({
              theme: parsed.theme || state.theme,
              backendUrl: parsed.backendUrl || state.backendUrl,
              apiTimeout: parsed.apiTimeout || state.apiTimeout,
              streamingEnabled: parsed.streamingEnabled !== undefined ? parsed.streamingEnabled : state.streamingEnabled,
              shortcutsEnabled: parsed.shortcutsEnabled !== undefined ? parsed.shortcutsEnabled : state.shortcutsEnabled,
              developerModeEnabled: parsed.developerModeEnabled !== undefined ? parsed.developerModeEnabled : state.developerModeEnabled,
              temperature: parsed.temperature !== undefined ? parsed.temperature : state.temperature,
              topP: parsed.topP !== undefined ? parsed.topP : state.topP,
              topK: parsed.topK !== undefined ? parsed.topK : state.topK,
              maxTokens: parsed.maxTokens !== undefined ? parsed.maxTokens : state.maxTokens,
              conversations: Array.isArray(parsed.conversations) ? parsed.conversations : state.conversations,
              favoritePromptIds: Array.isArray(parsed.favoritePromptIds) ? parsed.favoritePromptIds : state.favoritePromptIds,
              customPrompts: Array.isArray(parsed.customPrompts) ? parsed.customPrompts : state.customPrompts,
            }))
            return true
          }
          return false
        } catch {
          return false
        }
      }
    }),
    {
      name: 'dsa-tutor-workspace-storage',
      partialize: (state) => ({
        theme: state.theme,
        leftSidebarCollapsed: state.leftSidebarCollapsed,
        rightPanelCollapsed: state.rightPanelCollapsed,
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        activeCategory: state.activeCategory,
        favoritePromptIds: state.favoritePromptIds,
        customPrompts: state.customPrompts,
        backendUrl: state.backendUrl,
        apiTimeout: state.apiTimeout,
        streamingEnabled: state.streamingEnabled,
        shortcutsEnabled: state.shortcutsEnabled,
        developerModeEnabled: state.developerModeEnabled,
        temperature: state.temperature,
        topP: state.topP,
        topK: state.topK,
        maxTokens: state.maxTokens,
      })
    }
  )
)
