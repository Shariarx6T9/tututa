// ============================================================
// AYRA — Global State Stores (Zustand)
// ============================================================

import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { Chat, ChatMessage, Task, Memory, OllamaModel } from "@/types";

// ── UI Store ──────────────────────────────────────────────────

interface UIStore {
  sidebarCollapsed: boolean;
  commandOpen: boolean;
  activeSection: string;
  searchQuery: string;
  isMobile: boolean;

  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
  setCommandOpen: (v: boolean) => void;
  setActiveSection: (section: string) => void;
  setSearchQuery: (q: string) => void;
  setIsMobile: (v: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      commandOpen: false,
      activeSection: "dashboard",
      searchQuery: "",
      isMobile: false,

      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setCommandOpen: (v) => set({ commandOpen: v }),
      setActiveSection: (section) => set({ activeSection: section }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setIsMobile: (v) => set({ isMobile: v }),
    }),
    {
      name: "ayra-ui",
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        activeSection: s.activeSection,
      }),
    }
  )
);

// ── Chat Store ────────────────────────────────────────────────

interface ChatStreamState {
  isStreaming: boolean;
  streamingChatId: string | null;
  streamingContent: string;
  streamingThinking: string;
}

interface ChatStore {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Record<string, ChatMessage[]>;
  stream: ChatStreamState;
  selectedModel: string;

  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChat: (id: string, updates: Partial<Chat>) => void;
  deleteChat: (id: string) => void;
  setActiveChat: (chat: Chat | null) => void;
  setMessages: (chatId: string, messages: ChatMessage[]) => void;
  addMessage: (chatId: string, message: ChatMessage) => void;
  updateMessage: (chatId: string, id: string, updates: Partial<ChatMessage>) => void;
  setStream: (state: Partial<ChatStreamState>) => void;
  clearStream: () => void;
  setSelectedModel: (model: string) => void;
}

export const useChatStore = create<ChatStore>()(
  immer((set) => ({
    chats: [],
    activeChat: null,
    messages: {},
    selectedModel: "llama3.2",
    stream: {
      isStreaming: false,
      streamingChatId: null,
      streamingContent: "",
      streamingThinking: "",
    },

    setChats: (chats) => set({ chats }),
    addChat: (chat) =>
      set((s) => { s.chats.unshift(chat); }),
    updateChat: (id, updates) =>
      set((s) => {
        const i = s.chats.findIndex((c) => c.id === id);
        if (i !== -1) Object.assign(s.chats[i], updates);
        if (s.activeChat?.id === id) Object.assign(s.activeChat, updates);
      }),
    deleteChat: (id) =>
      set((s) => {
        s.chats = s.chats.filter((c) => c.id !== id);
        if (s.activeChat?.id === id) s.activeChat = null;
        delete s.messages[id];
      }),
    setActiveChat: (chat) => set({ activeChat: chat }),
    setMessages: (chatId, messages) =>
      set((s) => { s.messages[chatId] = messages; }),
    addMessage: (chatId, message) =>
      set((s) => {
        if (!s.messages[chatId]) s.messages[chatId] = [];
        s.messages[chatId].push(message);
      }),
    updateMessage: (chatId, id, updates) =>
      set((s) => {
        const msgs = s.messages[chatId];
        if (!msgs) return;
        const i = msgs.findIndex((m) => m.id === id);
        if (i !== -1) Object.assign(msgs[i], updates);
      }),
    setStream: (state) =>
      set((s) => { Object.assign(s.stream, state); }),
    clearStream: () =>
      set((s) => {
        s.stream = {
          isStreaming: false,
          streamingChatId: null,
          streamingContent: "",
          streamingThinking: "",
        };
      }),
    setSelectedModel: (model) => set({ selectedModel: model }),
  }))
);

// ── Task Store ────────────────────────────────────────────────

interface TaskStore {
  tasks: Task[];
  filter: { status: string; priority: string; collectionId: string };
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setFilter: (f: Partial<TaskStore["filter"]>) => void;
}

export const useTaskStore = create<TaskStore>()(
  immer((set) => ({
    tasks: [],
    filter: { status: "TODO", priority: "", collectionId: "" },

    setTasks: (tasks) => set({ tasks }),
    addTask: (task) =>
      set((s) => { s.tasks.unshift(task); }),
    updateTask: (id, updates) =>
      set((s) => {
        const i = s.tasks.findIndex((t) => t.id === id);
        if (i !== -1) Object.assign(s.tasks[i], updates);
      }),
    deleteTask: (id) =>
      set((s) => { s.tasks = s.tasks.filter((t) => t.id !== id); }),
    setFilter: (f) =>
      set((s) => { Object.assign(s.filter, f); }),
  }))
);

// ── Memory Store ──────────────────────────────────────────────

interface MemoryStore {
  memories: Memory[];
  setMemories: (memories: Memory[]) => void;
  addMemory: (memory: Memory) => void;
  updateMemory: (id: string, updates: Partial<Memory>) => void;
  deleteMemory: (id: string) => void;
}

export const useMemoryStore = create<MemoryStore>()(
  immer((set) => ({
    memories: [],
    setMemories: (memories) => set({ memories }),
    addMemory: (memory) =>
      set((s) => { s.memories.unshift(memory); }),
    updateMemory: (id, updates) =>
      set((s) => {
        const i = s.memories.findIndex((m) => m.id === id);
        if (i !== -1) Object.assign(s.memories[i], updates);
      }),
    deleteMemory: (id) =>
      set((s) => { s.memories = s.memories.filter((m) => m.id !== id); }),
  }))
);

// ── Model Store ───────────────────────────────────────────────

interface ModelStore {
  models: OllamaModel[];
  isLoading: boolean;
  ollamaAvailable: boolean;
  setModels: (models: OllamaModel[]) => void;
  setLoading: (v: boolean) => void;
  setOllamaAvailable: (v: boolean) => void;
}

export const useModelStore = create<ModelStore>()(
  subscribeWithSelector((set) => ({
    models: [],
    isLoading: false,
    ollamaAvailable: false,
    setModels: (models) => set({ models }),
    setLoading: (v) => set({ isLoading: v }),
    setOllamaAvailable: (v) => set({ ollamaAvailable: v }),
  }))
);
