"use client";

import clsx from "clsx";
import { useState } from "react";
import {
  PRIORITY_COLOR,
  PRIORITY_LABEL,
  useTasksStore,
} from "@/stores/useTasksStore";
import type { Task } from "@/lib/types";
import { ICONS } from "@/lib/assets";
import { Icon } from "@/components/ui/Icon";
import { TaskPipeline } from "./TaskPipeline";
import { proximaApi } from "@/lib/proxima-api";

interface TaskCardProps {
  task: Task;
  expanded: boolean;
  onToggle: () => void;
}

function formatDeadline(ts: number): {
  label: string;
  overdue: boolean;
  soon: boolean;
} {
  const now = Date.now();
  const overdue = ts < now;
  const soon = !overdue && ts - now < 24 * 3600_000;
  const d = new Date(ts);
  const label = d.toLocaleString("ru", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  return { label, overdue, soon };
}

export function TaskCard({ task, expanded, onToggle }: TaskCardProps) {
  const remove = useTasksStore((s) => s.remove);
  const togglePinned = useTasksStore((s) => s.togglePinned);
  const rename = useTasksStore((s) => s.rename);
  const setPipeline = useTasksStore((s) => s.setPipeline);
  const patch = useTasksStore((s) => s.patch);

  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(task.title);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dl = task.deadline ? formatDeadline(task.deadline) : null;

  const onRegenerate = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await proximaApi.generatePipeline({
        title: task.title,
        description: task.description,
        priority: task.priority,
        deadlineHours:
          task.deadline && task.deadline > Date.now()
            ? Math.round((task.deadline - Date.now()) / 3600_000)
            : undefined,
      });
      setPipeline(task.id, res.pipeline);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка генерации");
    } finally {
      setBusy(false);
    }
  };

  const submitRename = () => {
    const next = renameValue.trim();
    if (next && next !== task.title) rename(task.id, next);
    setRenaming(false);
  };

  return (
    <div
      className={clsx(
        "rounded-lg border overflow-hidden transition-colors",
        task.pinned
          ? "border-white/20 bg-[var(--glass-bg)]"
          : "border-[var(--glass-border)] bg-[var(--glass-bg)]",
        task.progress === 100 && "opacity-70"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-start gap-3 p-3 text-left hover:bg-white/5"
      >
        <span
          className="shrink-0 w-2.5 h-2.5 rounded-full mt-1.5"
          style={{ background: PRIORITY_COLOR[task.priority] }}
          aria-label={PRIORITY_LABEL[task.priority]}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {task.pinned && (
              <Icon src={ICONS.pin} size={11} style={{ opacity: 0.8 }} />
            )}
            <span
              className={clsx(
                "text-sm font-medium text-[var(--text-primary)] truncate",
                task.progress === 100 && "line-through"
              )}
            >
              {task.title}
            </span>
          </div>
          {task.description && !expanded && (
            <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 line-clamp-1">
              {task.description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full transition-all"
                style={{
                  width: `${task.progress}%`,
                  background: PRIORITY_COLOR[task.priority],
                }}
              />
            </div>
            <span className="text-[10px] tabular-nums text-[var(--text-tertiary)] w-10 text-right">
              {task.steps.filter((s) => s.completed).length}/{task.steps.length}
            </span>
          </div>
        </div>
        {dl && (
          <span
            className={clsx(
              "text-[10px] tabular-nums whitespace-nowrap ml-2 mt-1",
              dl.overdue
                ? "text-red-400"
                : dl.soon
                  ? "text-yellow-300"
                  : "text-[var(--text-tertiary)]"
            )}
          >
            {dl.overdue && "⚠ "}
            {dl.label}
          </span>
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3 flex flex-col gap-3 border-t border-[var(--glass-border)]">
          {renaming ? (
            <div className="flex items-center gap-2 mt-2">
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitRename();
                  if (e.key === "Escape") setRenaming(false);
                }}
                className="flex-1 px-3 h-9 rounded-md border border-[var(--glass-border)] bg-black/20 outline-none text-sm"
              />
              <button
                type="button"
                onClick={submitRename}
                className="h-9 px-3 rounded-md bg-white/10 text-xs"
              >
                ОК
              </button>
            </div>
          ) : (
            task.description && (
              <p className="text-[12px] text-[var(--text-secondary)] mt-2 whitespace-pre-line">
                {task.description}
              </p>
            )
          )}

          <TaskPipeline task={task} />

          {error && (
            <div className="text-[11px] text-red-400 px-1">{error}</div>
          )}

          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[var(--glass-border)]/50">
            <ActionButton
              onClick={() => togglePinned(task.id)}
              icon={ICONS.pin}
              label={task.pinned ? "Открепить" : "Закрепить"}
              active={!!task.pinned}
            />
            <ActionButton
              onClick={() => {
                setRenameValue(task.title);
                setRenaming(true);
              }}
              icon={ICONS.rename}
              label="Переименовать"
            />
            <ActionButton
              onClick={onRegenerate}
              icon={ICONS.idea}
              label={busy ? "Генерация…" : "Pipeline ИИ"}
              disabled={busy}
            />
            {task.progress === 100 ? (
              <ActionButton
                onClick={() => patch(task.id, { completedAt: null })}
                icon={ICONS.rate}
                label="Вернуть в работу"
              />
            ) : null}
            <ActionButton
              onClick={() => remove(task.id)}
              icon={ICONS.delete}
              label="Удалить"
              danger
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({
  onClick,
  icon,
  label,
  active,
  danger,
  disabled,
}: {
  onClick: () => void;
  icon: string;
  label: string;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] border transition-colors",
        active
          ? "bg-white/10 border-white/20 text-[var(--text-primary)]"
          : "bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-white/5",
        danger && "hover:!bg-red-500/15 hover:!text-red-300",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      <Icon src={icon} size={11} />
      <span>{label}</span>
    </button>
  );
}
