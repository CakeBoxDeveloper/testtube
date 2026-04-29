"use client";

import { useMemo, useState } from "react";
import { sortTasks, useTasksStore } from "@/stores/useTasksStore";
import { useHydrated } from "@/hooks/useHydrated";
import { TaskCard } from "./TaskCard";
import { TaskCreateForm } from "./TaskCreateForm";
import { AiTaskQuickModal } from "./AiTaskQuickModal";

export function TasksView() {
  const hydrated = useHydrated();
  const tasks = useTasksStore((s) => s.tasks);
  const order = useTasksStore((s) => s.order);
  const creating = useTasksStore((s) => s.creating);
  const setCreating = useTasksStore((s) => s.setCreating);
  const query = useTasksStore((s) => s.query);
  const setQuery = useTasksStore((s) => s.setQuery);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);

  const allTasks = useMemo(
    () => (hydrated ? order.map((id) => tasks[id]).filter(Boolean) : []),
    [hydrated, order, tasks]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allTasks;
    return allTasks.filter((t) => {
      if (t.title.toLowerCase().includes(q)) return true;
      if (t.description?.toLowerCase().includes(q)) return true;
      return t.steps.some((s) => s.title.toLowerCase().includes(q));
    });
  }, [allTasks, query]);

  const sorted = useMemo(() => sortTasks(filtered), [filtered]);
  const open = sorted.filter((t) => t.progress < 100);
  const done = sorted.filter((t) => t.progress === 100);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--glass-border)] shrink-0">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск…"
          className="flex-1 min-w-0 h-8 px-3 rounded-md border border-[var(--glass-border)] bg-black/20 outline-none text-xs"
        />
        <button
          type="button"
          onClick={() => setAiOpen(true)}
          className="shrink-0 h-8 px-2.5 rounded-md border border-[var(--glass-border)] bg-white/5 hover:bg-white/10 text-xs text-[var(--text-primary)]"
          title="Создать через ИИ"
        >
          ✨
        </button>
        <button
          type="button"
          onClick={() => setCreating(!creating)}
          className="shrink-0 h-8 px-2.5 rounded-md border border-[var(--glass-border)] bg-white/5 hover:bg-white/10 text-xs text-[var(--text-primary)]"
        >
          + Задача
        </button>
      </div>

      <div className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] flex items-center justify-between shrink-0">
        <span>
          {open.length} активн{open.length === 1 ? "ая" : open.length < 5 ? "ые" : "ых"}
          {done.length > 0 && ` · ${done.length} готов${done.length === 1 ? "а" : "ы"}`}
        </span>
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="hover:text-[var(--text-primary)]"
          >
            сбросить ✕
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-0">
        {creating && <TaskCreateForm />}

        {!creating && allTasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-center p-6 text-[11px] text-[var(--text-tertiary)]">
            Задач пока нет. Создай первую — или попроси Проксиму через ✨.
          </div>
        )}

        {!creating && allTasks.length > 0 && sorted.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-center p-6 text-[11px] text-[var(--text-tertiary)]">
            По запросу «{query}» ничего не найдено.
          </div>
        )}

        {open.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            expanded={expandedId === task.id}
            onToggle={() =>
              setExpandedId(expandedId === task.id ? null : task.id)
            }
          />
        ))}

        {done.length > 0 && (
          <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mt-3 pl-1">
            Готовые
          </div>
        )}
        {done.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            expanded={expandedId === task.id}
            onToggle={() =>
              setExpandedId(expandedId === task.id ? null : task.id)
            }
          />
        ))}
      </div>

      <AiTaskQuickModal open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
