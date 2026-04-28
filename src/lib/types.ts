export type Gender = "male" | "female";
export type Theme = "dark" | "light" | "auto";
export type MonitorSkin = "heat" | "xray" | "grid";

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

export interface Task {
  title: string;
  description: string;
  priority: 0 | 1 | 2 | 3 | 4;
  pipeline: string;
  status: string;
  deadline: string;
  completedSteps: number[];
  createdAt?: number;
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
  achievements?: unknown[];
  notes?: Note[];
  weightData?: Record<string, unknown>;
  statsData?: Record<string, unknown>;
  bioProfile?: Record<string, unknown>;
  monitorStats?: Record<string, unknown>;
}

export interface ApiError {
  error: string;
  details?: unknown;
}
