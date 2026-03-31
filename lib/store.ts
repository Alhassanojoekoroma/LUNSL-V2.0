"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Task, ScheduleEntry, Message, Content, AIInteraction, TokenBalance, QuizScore, LearningGoal, AIConfig } from './types'
import { userAPI, tokensAPI, progressAPI, courseAPI } from './api-client'

// Auth Store
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  loadUser: () => Promise<void>
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      loadUser: async () => {
        set({ isLoading: true })
        try {
          const user = await userAPI.getProfile()
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (error) {
          console.error('Failed to load user:', error)
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    { 
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false
        }
      }
    }
  )
)

// Tasks Store
interface TasksState {
  tasks: Task[]
  isLoading: boolean
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  setTasks: (tasks: Task[]) => void
  setLoading: (loading: boolean) => void
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set) => ({
      tasks: [],
      isLoading: false,
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
      setTasks: (tasks) => set({ tasks }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    { name: 'tasks-storage' }
  )
)

// Schedule Store
interface ScheduleState {
  entries: ScheduleEntry[]
  isLoading: boolean
  addEntry: (entry: ScheduleEntry) => void
  updateEntry: (id: string, updates: Partial<ScheduleEntry>) => void
  deleteEntry: (id: string) => void
  setEntries: (entries: ScheduleEntry[]) => void
  setLoading: (loading: boolean) => void
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set) => ({
      entries: [],
      isLoading: false,
      addEntry: (entry) => set((state) => ({ entries: [...state.entries, entry] })),
      updateEntry: (id, updates) =>
        set((state) => ({
          entries: state.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),
      deleteEntry: (id) => set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
      setEntries: (entries) => set({ entries }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    { name: 'schedule-storage' }
  )
)

// Messages Store
interface MessagesState {
  messages: Message[]
  isLoading: boolean
  addMessage: (message: Message) => void
  markAsRead: (id: string) => void
  deleteMessage: (id: string) => void
  setMessages: (messages: Message[]) => void
  setLoading: (loading: boolean) => void
}

export const useMessagesStore = create<MessagesState>()(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,
      addMessage: (message) => set((state) => ({ messages: [message, ...state.messages] })),
      markAsRead: (id) =>
        set((state) => ({
          messages: state.messages.map((m) => (m.id === id ? { ...m, is_read: true } : m)),
        })),
      deleteMessage: (id) => set((state) => ({ messages: state.messages.filter((m) => m.id !== id) })),
      setMessages: (messages) => set({ messages }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    { name: 'messages-storage' }
  )
)

// AI Chat Store
interface AIChatState {
  interactions: AIInteraction[]
  currentSources: Content[]
  config: AIConfig
  isLoading: boolean
  addInteraction: (interaction: AIInteraction) => void
  clearInteractions: () => void
  setSources: (sources: Content[]) => void
  addSource: (source: Content) => void
  removeSource: (id: string) => void
  setConfig: (config: Partial<AIConfig>) => void
  setLoading: (loading: boolean) => void
}

export const useAIChatStore = create<AIChatState>()(
  persist(
    (set) => ({
      interactions: [],
      currentSources: [],
      config: {
        learningLevel: 'intermediate',
        conversationStyle: 'default',
        responseLength: 'default',
      },
      isLoading: false,
      addInteraction: (interaction) =>
        set((state) => ({ interactions: [...state.interactions, interaction] })),
      clearInteractions: () => set({ interactions: [] }),
      setSources: (sources) => set({ currentSources: sources }),
      addSource: (source) =>
        set((state) => ({
          currentSources: state.currentSources.some((s) => s.id === source.id)
            ? state.currentSources
            : [...state.currentSources, source],
        })),
      removeSource: (id) =>
        set((state) => ({ currentSources: state.currentSources.filter((s) => s.id !== id) })),
      setConfig: (config) => set((state) => ({ config: { ...state.config, ...config } })),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    { name: 'ai-chat-storage' }
  )
)

// Token Store
interface TokenState {
  balance: TokenBalance | null
  isLoading: boolean
  setBalance: (balance: TokenBalance) => void
  loadBalance: () => Promise<void>
  deductToken: () => void
  addTokens: (amount: number) => void
  setLoading: (loading: boolean) => void
}

export const useTokenStore = create<TokenState>()(
  persist(
    (set) => ({
      balance: null,
      isLoading: false,
      setBalance: (balance) => set({ balance }),
      loadBalance: async () => {
        set({ isLoading: true })
        try {
          const data = await tokensAPI.getBalance()
          set({ balance: { available: data.balance, used: 0, total: data.balance, bonus: 0 }, isLoading: false })
        } catch (error) {
          console.error('Failed to load token balance:', error)
          set({ isLoading: false })
        }
      },
      deductToken: () =>
        set((state) => ({
          balance: state.balance
            ? { ...state.balance, available: state.balance.available - 1, used: state.balance.used + 1 }
            : null,
        })),
      addTokens: (amount) =>
        set((state) => ({
          balance: state.balance
            ? { ...state.balance, available: state.balance.available + amount, total: state.balance.total + amount }
            : null,
        })),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    { name: 'token-storage' }
  )
)

// Progress Store
interface ProgressState {
  quizScores: QuizScore[]
  learningGoals: LearningGoal[]
  isLoading: boolean
  addQuizScore: (score: QuizScore) => void
  addGoal: (goal: LearningGoal) => void
  updateGoal: (id: string, updates: Partial<LearningGoal>) => void
  deleteGoal: (id: string) => void
  setLoading: (loading: boolean) => void
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      quizScores: [],
      learningGoals: [],
      isLoading: false,
      addQuizScore: (score) => set((state) => ({ quizScores: [...state.quizScores, score] })),
      addGoal: (goal) => set((state) => ({ learningGoals: [...state.learningGoals, goal] })),
      updateGoal: (id, updates) =>
        set((state) => ({
          learningGoals: state.learningGoals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),
      deleteGoal: (id) => set((state) => ({ learningGoals: state.learningGoals.filter((g) => g.id !== id) })),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    { name: 'progress-storage' }
  )
)

// Content Store (for browsing)
interface ContentState {
  contents: Content[]
  selectedContent: Content | null
  isLoading: boolean
  filters: {
    module: string
    lecturer: string
    contentType: string
    sortBy: 'newest' | 'views' | 'downloads'
  }
  setContents: (contents: Content[]) => void
  setSelectedContent: (content: Content | null) => void
  setFilters: (filters: Partial<ContentState['filters']>) => void
  setLoading: (loading: boolean) => void
  loadContents: () => Promise<void>
}

export const useContentStore = create<ContentState>()((set) => ({
  contents: [],
  selectedContent: null,
  isLoading: false,
  filters: {
    module: '',
    lecturer: '',
    contentType: '',
    sortBy: 'newest',
  },
  setContents: (contents) => set({ contents }),
  setSelectedContent: (content) => set({ selectedContent: content }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  loadContents: async () => {
    set({ isLoading: true })
    try {
      // Get courses from backend
      const response = await courseAPI.getCourses(1, 100)
      set({ contents: response || [], isLoading: false })
    } catch (error) {
      console.error('Failed to load contents:', error)
      set({ isLoading: false })
    }
  },
}))

