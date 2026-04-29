export type Gender = "male" | "female";
export type Theme = "dark" | "light" | "auto";
export type MonitorSkin = "heat" | "xray" | "grid";

export type ModuleId = "sofia" | "proxima";

export type Priority = "low" | "medium" | "high" | "critical";

export interface ChatMessage {
  role: "user" | "ai";
  text: string;
  type?: string;
  id?: number;
}

export interface ChatMetadata {
  name: string;
  createdAt?: number;
  count?: number;
}

export interface ChatTab {
  id: string;
  module: ModuleId;
  title: string;
  pinned?: boolean;
  base?: boolean;
  createdAt: number;
  messages: ChatMessage[];
}

export type TaskStatus = "draft" | "ready" | "error";

export interface TaskStep {
  id: string;
  title: string;
  description?: string;
  parentId?: string | null;
  level: 0 | 1; // 0 = main step, 1 = substep
  completed: boolean;
  order: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  /** Source-of-truth markdown pipeline (AI-generated). When present, steps are derived from it. */
  pipeline?: string;
  /** Structured steps. When pipeline exists, treat as derived state; otherwise stand-alone manual steps. */
  steps: TaskStep[];
  priority: Priority;
  category?: string;
  deadline?: number | null;
  progress: number;
  pinned?: boolean;
  status?: TaskStatus;
  createdAt: number;
  updatedAt: number;
  completedAt?: number | null;
}

export interface TaskMetadata {
  name?: string;
  pinned?: boolean;
  deadline?: string;
}

export interface Note {
  id: string;
  title: string;
  desc: string;
}

export type MaterialType = "course" | "test" | "calculator" | "workout";

export interface MaterialItem {
  id: string;
  title: string;
  description?: string;
  type: MaterialType;
  icon?: string;
  locked?: boolean;
  purchased?: boolean;
  progress?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description?: string;
  unlockedAt?: number;
  icon?: string;
}

export interface WeightEntry {
  date: number;
  weight: number;
}

export interface User {
  id: number;
  pin: string;
  age: number;
  gender: Gender;
  lastUpdated?: number;
  chats_taskorganizer?: Record<string, ChatMessage[]>;
  chatMetadata?: Record<string, ChatMetadata>;
  pinnedChats?: string[];
  tasks_helix?: Record<string, Task>;
  taskMetadata?: Record<string, TaskMetadata>;
  achievements?: Achievement[];
  notes?: Note[];
  weightData?: WeightEntry[];
  statsData?: Record<string, unknown>;
  bioProfile?: Record<string, unknown>;
  monitorStats?: Record<string, unknown>;
}

export interface ApiError {
  error: string;
  details?: unknown;
}
