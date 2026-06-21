// ============================================================
// AYRA — Core Type Definitions
// ============================================================

// ── Chat ─────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  thinking?: string;
  model?: string;
  tokenCount?: number;
  latency?: number;
  attachments?: Attachment[];
  isEdited?: boolean;
  editedAt?: Date;
  createdAt: Date;
}

export interface Chat {
  id: string;
  userId: string;
  folderId?: string;
  title: string;
  summary?: string;
  model: string;
  isPinned: boolean;
  isArchived: boolean;
  tags: string[];
  tokenCount: number;
  messages?: ChatMessage[];
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatFolder {
  id: string;
  userId: string;
  name: string;
  color?: string;
  icon?: string;
  position: number;
  isExpanded: boolean;
  chats?: Chat[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  messageId: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  content?: string;
  createdAt: Date;
}

// ── Stream ────────────────────────────────────────────────────

export interface StreamChunk {
  type: "text" | "thinking" | "tool_use" | "tool_result" | "error" | "done";
  content?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

// ── Memory ────────────────────────────────────────────────────

export type MemoryType =
  | "FACT"
  | "PREFERENCE"
  | "PROJECT"
  | "RELATIONSHIP"
  | "GOAL"
  | "SKILL"
  | "CONTEXT"
  | "MEDICAL"
  | "FINANCIAL"
  | "PERSONAL";

export type MemoryImportance = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Memory {
  id: string;
  userId: string;
  type: MemoryType;
  importance: MemoryImportance;
  title: string;
  content: string;
  context?: string;
  tags: string[];
  source?: string;
  confidence: number;
  isVerified: boolean;
  isPinned: boolean;
  expiresAt?: Date;
  accessCount: number;
  lastAccessed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryProfile {
  id: string;
  userId: string;
  preferredName?: string;
  pronouns?: string;
  timezone?: string;
  location?: string;
  occupation?: string;
  bio?: string;
  communicationStyle?: string;
  preferredLanguage?: string;
  expertiseLevel?: string;
  interests: string[];
  dislikedTopics: string[];
  activeHours?: { weekday: [number, number]; weekend: [number, number] };
  workingStyle?: string;
  updatedAt: Date;
}

// ── Task ──────────────────────────────────────────────────────

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED" | "DEFERRED";
export type TaskPriority = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type RecurrenceType = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";

export interface Task {
  id: string;
  userId: string;
  collectionId?: string;
  parentId?: string;
  children?: Task[];
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  dueDate?: Date;
  dueTime?: string;
  startDate?: Date;
  completedAt?: Date;
  reminderAt?: Date;
  isRecurring: boolean;
  recurrenceType?: RecurrenceType;
  recurrenceRule?: string;
  aiGenerated: boolean;
  estimatedMin?: number;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskCollection {
  id: string;
  userId: string;
  name: string;
  icon?: string;
  color?: string;
  isDefault: boolean;
  position: number;
  tasks?: Task[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Vault ─────────────────────────────────────────────────────

export type VaultItemType =
  | "PDF"
  | "DOCUMENT"
  | "NOTE"
  | "IMAGE"
  | "PRESCRIPTION"
  | "MEDICAL_REPORT"
  | "FINANCIAL"
  | "CODE"
  | "LINK"
  | "OTHER";

export interface VaultItem {
  id: string;
  userId: string;
  folderId?: string;
  type: VaultItemType;
  title: string;
  description?: string;
  content?: string;
  rawContent?: string;
  url?: string;
  filename?: string;
  mimeType?: string;
  size?: number;
  pageCount?: number;
  tags: string[];
  metadata?: Record<string, unknown>;
  isNote: boolean;
  isPinned: boolean;
  isProcessed: boolean;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface VaultFolder {
  id: string;
  userId: string;
  parentId?: string;
  children?: VaultFolder[];
  name: string;
  icon?: string;
  color?: string;
  isPrivate: boolean;
  position: number;
  items?: VaultItem[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Code ──────────────────────────────────────────────────────

export type ProjectLanguage =
  | "JAVASCRIPT" | "TYPESCRIPT" | "PYTHON" | "RUST" | "GO"
  | "JAVA" | "CPP" | "CSS" | "HTML" | "SQL"
  | "SHELL" | "MARKDOWN" | "JSON" | "YAML" | "OTHER";

export interface CodeProject {
  id: string;
  userId: string;
  name: string;
  description?: string;
  language: ProjectLanguage;
  framework?: string;
  tags: string[];
  context?: string;
  isActive: boolean;
  files?: CodeFile[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeFile {
  id: string;
  userId: string;
  projectId?: string;
  filename: string;
  path: string;
  language: string;
  content: string;
  size: number;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Studio ────────────────────────────────────────────────────

export type ImageEngine = "STABLE_DIFFUSION" | "COMFYUI" | "DALLE" | "OTHER";

export interface StudioImage {
  id: string;
  userId: string;
  collectionId?: string;
  prompt: string;
  negativePrompt?: string;
  model?: string;
  engine: ImageEngine;
  url: string;
  thumbnail?: string;
  width: number;
  height: number;
  seed?: bigint;
  steps?: number;
  cfgScale?: number;
  sampler?: string;
  metadata?: Record<string, unknown>;
  isFavorite: boolean;
  tags: string[];
  createdAt: Date;
}

export interface StudioCollection {
  id: string;
  userId: string;
  name: string;
  cover?: string;
  isDefault: boolean;
  position: number;
  images?: StudioImage[];
  createdAt: Date;
  updatedAt: Date;
}

// ── AI Model ──────────────────────────────────────────────────

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
  details?: {
    format: string;
    family: string;
    parameter_size: string;
    quantization_level: string;
  };
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: "ollama" | "openai" | "anthropic";
  contextLength: number;
  supportsVision: boolean;
  supportsCode: boolean;
  supportsThinking: boolean;
  icon?: string;
}

// ── UI State ──────────────────────────────────────────────────

export interface SidebarState {
  isCollapsed: boolean;
  activeSection: string;
}

export interface CommandPaletteState {
  isOpen: boolean;
  query: string;
}

export type Theme = "dark"; // AYRA is dark-only
