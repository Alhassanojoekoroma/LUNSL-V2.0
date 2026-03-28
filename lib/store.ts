"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Task, ScheduleEntry, Message, Content, AIInteraction, TokenBalance, QuizScore, LearningGoal, AIConfig } from './types'

// Auth Store
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
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
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  setTasks: (tasks: Task[]) => void
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
      setTasks: (tasks) => set({ tasks }),
    }),
    { name: 'tasks-storage' }
  )
)

// Schedule Store
interface ScheduleState {
  entries: ScheduleEntry[]
  addEntry: (entry: ScheduleEntry) => void
  updateEntry: (id: string, updates: Partial<ScheduleEntry>) => void
  deleteEntry: (id: string) => void
  setEntries: (entries: ScheduleEntry[]) => void
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) => set((state) => ({ entries: [...state.entries, entry] })),
      updateEntry: (id, updates) =>
        set((state) => ({
          entries: state.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),
      deleteEntry: (id) => set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
      setEntries: (entries) => set({ entries }),
    }),
    { name: 'schedule-storage' }
  )
)

// Messages Store
interface MessagesState {
  messages: Message[]
  addMessage: (message: Message) => void
  markAsRead: (id: string) => void
  deleteMessage: (id: string) => void
  setMessages: (messages: Message[]) => void
}

export const useMessagesStore = create<MessagesState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (message) => set((state) => ({ messages: [message, ...state.messages] })),
      markAsRead: (id) =>
        set((state) => ({
          messages: state.messages.map((m) => (m.id === id ? { ...m, is_read: true } : m)),
        })),
      deleteMessage: (id) => set((state) => ({ messages: state.messages.filter((m) => m.id !== id) })),
      setMessages: (messages) => set({ messages }),
    }),
    { name: 'messages-storage' }
  )
)

// AI Chat Store
interface AIChatState {
  interactions: AIInteraction[]
  currentSources: Content[]
  config: AIConfig
  addInteraction: (interaction: AIInteraction) => void
  clearInteractions: () => void
  setSources: (sources: Content[]) => void
  addSource: (source: Content) => void
  removeSource: (id: string) => void
  setConfig: (config: Partial<AIConfig>) => void
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
    }),
    { name: 'ai-chat-storage' }
  )
)

// Token Store
interface TokenState {
  balance: TokenBalance | null
  setBalance: (balance: TokenBalance) => void
  deductToken: () => void
  addTokens: (amount: number) => void
}

export const useTokenStore = create<TokenState>()(
  persist(
    (set) => ({
      balance: null,
      setBalance: (balance) => set({ balance }),
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
    }),
    { name: 'token-storage' }
  )
)

// Progress Store
interface ProgressState {
  quizScores: QuizScore[]
  learningGoals: LearningGoal[]
  addQuizScore: (score: QuizScore) => void
  addGoal: (goal: LearningGoal) => void
  updateGoal: (id: string, updates: Partial<LearningGoal>) => void
  deleteGoal: (id: string) => void
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      quizScores: [],
      learningGoals: [],
      addQuizScore: (score) => set((state) => ({ quizScores: [...state.quizScores, score] })),
      addGoal: (goal) => set((state) => ({ learningGoals: [...state.learningGoals, goal] })),
      updateGoal: (id, updates) =>
        set((state) => ({
          learningGoals: state.learningGoals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),
      deleteGoal: (id) => set((state) => ({ learningGoals: state.learningGoals.filter((g) => g.id !== id) })),
    }),
    { name: 'progress-storage' }
  )
)

// Content Store (for browsing)
interface ContentState {
  contents: Content[]
  selectedContent: Content | null
  filters: {
    module: string
    lecturer: string
    contentType: string
    sortBy: 'newest' | 'views' | 'downloads'
  }
  setContents: (contents: Content[]) => void
  setSelectedContent: (content: Content | null) => void
  setFilters: (filters: Partial<ContentState['filters']>) => void
}

export const useContentStore = create<ContentState>()((set) => ({
  contents: [],
  selectedContent: null,
  filters: {
    module: '',
    lecturer: '',
    contentType: '',
    sortBy: 'newest',
  },
  setContents: (contents) => set({ contents }),
  setSelectedContent: (content) => set({ selectedContent: content }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
}))
