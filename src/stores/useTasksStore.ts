"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Priority, Task, TaskStep } from "@/lib/types";
import {
  computeStepsProgress,
  pipelineToSteps,
  toggleStepCascade,
} from "@/lib/pipeline";

export interface CreateTaskInput {
  title: string;
  description?: string;
  /** Plain step titles for manual tasks (no hierarchy). */
  steps?: string[];
  /** Markdown pipeline (AI-generated). When set, takes precedence over steps. */
  pipeline?: string;
  priority?: Priority;
  deadline?: number | null;
  category?: string;
  pinned?: boolean;
}

interface TasksState {
  tasks: Record<string, Task>;
  order: string[];
  selectedId: string | null;
  creating: boolean;
  query: string;

  create: (input: CreateTaskInput) => string;
  patch: (id: string, patch: Partial<Task>) => void;
  remove: (id: string) => void;
  toggleStep: (taskId: string, stepId: string) => void;
  addStep: (taskId: string, title: string) => void;
  removeStep: (taskId: string, stepId: string) => void;
  setPipeline: (taskId: string, pipeline: string) => void;
  togglePinned: (taskId: string) => void;
  rename: (taskId: string, title: string) => void;
  setSelected: (id: string | null) => void;
  setCreating: (creating: boolean) => void;
  setQuery: (q: string) => void;
  hydrate: (tasks: Record<string, Task>) => void;
}

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

function stepsFromPlainList(titles: string[]): TaskStep[] {
  return titles
    .map((t) => t.trim())
    .filter(Boolean)
    .map((title, i) => ({
      id: makeId("step"),
      title,
      parentId: null,
      level: 0 as const,
      completed: false,
      order: i,
    }));
}

function recomputeTask(task: Task): Task {
  const progress = computeStepsProgress(task.steps);
  let completedAt = task.completedAt ?? null;
  if (progress === 100 && !completedAt) completedAt = Date.now();
  if (progress < 100) completedAt = null;
  return { ...task, progress, completedAt };
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set) => ({
      tasks: {},
      order: [],
      selectedId: null,
      creating: false,
      query: "",

      create: (input) => {
        const id = makeId("task");
        const now = Date.now();
        const steps: TaskStep[] = input.pipeline
          ? pipelineToSteps(input.pipeline)
          : stepsFromPlainList(input.steps ?? []);
        const task: Task = recomputeTask({
          id,
          title: input.title,
          description: input.description,
          pipeline: input.pipeline,
          steps,
          priority: input.priority ?? "medium",
          deadline: input.deadline ?? null,
          category: input.category,
          pinned: input.pinned,
          status: "ready",
          progress: 0,
          createdAt: now,
          updatedAt: now,
          completedAt: null,
        });
        set((state) => ({
          tasks: { ...state.tasks, [id]: task },
          order: [id, ...state.order],
          creating: false,
        }));
        return id;
      },

      patch: (id, patch) =>
        set((state) => {
          const existing = state.tasks[id];
          if (!existing) return state;
          const merged: Task = recomputeTask({
            ...existing,
            ...patch,
            updatedAt: Date.now(),
          });
          return { tasks: { ...state.tasks, [id]: merged } };
        }),

      remove: (id) =>
        set((state) => {
          const next = { ...state.tasks };
          delete next[id];
          return {
            tasks: next,
            order: state.order.filter((x) => x !== id),
            selectedId: state.selectedId === id ? null : state.selectedId,
          };
        }),

      toggleStep: (taskId, stepId) =>
        set((state) => {
          const t = state.tasks[taskId];
          if (!t) return state;
          const steps = toggleStepCascade(t.steps, stepId);
          const merged = recomputeTask({
            ...t,
            steps,
            updatedAt: Date.now(),
          });
          return { tasks: { ...state.tasks, [taskId]: merged } };
        }),

      addStep: (taskId, title) =>
        set((state) => {
          const t = state.tasks[taskId];
          if (!t) return state;
          const steps: TaskStep[] = [
            ...t.steps,
            {
              id: makeId("step"),
              title,
              parentId: null,
              level: 0,
              completed: false,
              order: t.steps.filter((s) => s.level === 0).length,
            },
          ];
          const merged = recomputeTask({
            ...t,
            steps,
            updatedAt: Date.now(),
          });
          return { tasks: { ...state.tasks, [taskId]: merged } };
        }),

      removeStep: (taskId, stepId) =>
        set((state) => {
          const t = state.tasks[taskId];
          if (!t) return state;
          const steps = t.steps.filter(
            (s) => s.id !== stepId && s.parentId !== stepId
          );
          const merged = recomputeTask({
            ...t,
            steps,
            updatedAt: Date.now(),
          });
          return { tasks: { ...state.tasks, [taskId]: merged } };
        }),

      setPipeline: (taskId, pipeline) =>
        set((state) => {
          const t = state.tasks[taskId];
          if (!t) return state;
          const steps = pipelineToSteps(pipeline, t.steps);
          const merged = recomputeTask({
            ...t,
            pipeline,
            steps,
            updatedAt: Date.now(),
          });
          return { tasks: { ...state.tasks, [taskId]: merged } };
        }),

      togglePinned: (taskId) =>
        set((state) => {
          const t = state.tasks[taskId];
          if (!t) return state;
          return {
            tasks: {
              ...state.tasks,
              [taskId]: { ...t, pinned: !t.pinned, updatedAt: Date.now() },
            },
          };
        }),

      rename: (taskId, title) =>
        set((state) => {
          const t = state.tasks[taskId];
          if (!t) return state;
          const trimmed = title.trim();
          if (!trimmed) return state;
          return {
            tasks: {
              ...state.tasks,
              [taskId]: { ...t, title: trimmed, updatedAt: Date.now() },
            },
          };
        }),

      setSelected: (selectedId) => set({ selectedId }),
      setCreating: (creating) => set({ creating }),
      setQuery: (query) => set({ query }),

      hydrate: (incoming) => {
        const valid = Object.values(incoming).filter(
          (t): t is Task =>
            !!t && typeof t === "object" && typeof (t as Task).id === "string"
        );
        const order = valid
          .slice()
          .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
          .map((t) => t.id);
        const tasks = Object.fromEntries(valid.map((t) => [t.id, t]));
        set({ tasks, order, selectedId: null, creating: false });
      },
    }),
    {
      name: "mse:tasks",
      partialize: (s) => ({ tasks: s.tasks, order: s.order }),
    }
  )
);

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
  critical: "Критический",
};

export const PRIORITY_COLOR: Record<Priority, string> = {
  low: "#888",
  medium: "#d4b86a",
  high: "#e07b4d",
  critical: "#d65151",
};

/** Sort: pinned first, then completed last, then by createdAt desc. */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const ap = a.pinned ? 1 : 0;
    const bp = b.pinned ? 1 : 0;
    if (ap !== bp) return bp - ap;
    const ac = a.progress === 100 ? 1 : 0;
    const bc = b.progress === 100 ? 1 : 0;
    if (ac !== bc) return ac - bc;
    return b.createdAt - a.createdAt;
  });
}
