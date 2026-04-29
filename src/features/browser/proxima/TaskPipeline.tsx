"use client";

import clsx from "clsx";
import { useState } from "react";
import type { Task, TaskStep } from "@/lib/types";
import { useTasksStore } from "@/stores/useTasksStore";

interface TaskPipelineProps {
  task: Task;
}

interface MainStepGroup {
  main: TaskStep;
  subs: TaskStep[];
}

function groupSteps(steps: TaskStep[]): MainStepGroup[] {
  const mains = steps
    .filter((s) => s.level === 0)
    .sort((a, b) => a.order - b.order);
  return mains.map((m) => ({
    main: m,
    subs: steps
      .filter((s) => s.level === 1 && s.parentId === m.id)
      .sort((a, b) => a.order - b.order),
  }));
}

export function TaskPipeline({ task }: TaskPipelineProps) {
  const toggleStep = useTasksStore((s) => s.toggleStep);
  const groups = groupSteps(task.steps);

  if (groups.length === 0) {
    return (
      <div className="text-[11px] text-[var(--text-tertiary)] italic px-1 py-2">
        Шагов не задано.
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-1">
      {groups.map((g, i) => (
        <PipelineGroup
          key={g.main.id}
          group={g}
          index={i + 1}
          isLast={i === groups.length - 1}
          onToggle={(stepId) => toggleStep(task.id, stepId)}
        />
      ))}
    </ol>
  );
}

function PipelineGroup({
  group,
  index,
  isLast,
  onToggle,
}: {
  group: MainStepGroup;
  index: number;
  isLast: boolean;
  onToggle: (stepId: string) => void;
}) {
  const { main, subs } = group;
  const [expanded, setExpanded] = useState(true);
  const hasDescription = !!main.description?.trim();
  const hasSubs = subs.length > 0;

  return (
    <li className="relative">
      {!isLast && (
        <span
          className="absolute left-[14px] top-7 bottom-0 w-px bg-[var(--glass-border)]"
          aria-hidden
        />
      )}
      <div
        className={clsx(
          "flex items-start gap-2 rounded-md py-1.5 transition-colors",
          main.completed && "opacity-70"
        )}
      >
        <button
          type="button"
          onClick={() => onToggle(main.id)}
          aria-label={main.completed ? "Снять отметку" : "Отметить шаг"}
          className={clsx(
            "shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium tabular-nums border transition-colors",
            main.completed
              ? "bg-white/15 border-white/30 text-[var(--text-primary)]"
              : "bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-secondary)] hover:bg-white/10"
          )}
        >
          {main.completed ? "✓" : index}
        </button>
        <button
          type="button"
          onClick={() => {
            if (hasDescription || hasSubs) setExpanded(!expanded);
            else onToggle(main.id);
          }}
          className="flex-1 text-left min-w-0"
        >
          <div
            className={clsx(
              "text-sm leading-snug text-[var(--text-primary)]",
              main.completed && "line-through"
            )}
          >
            {main.title}
          </div>
          {hasDescription && (
            <div
              className={clsx(
                "text-[11px] text-[var(--text-tertiary)] mt-0.5 whitespace-pre-line",
                !expanded && "line-clamp-1"
              )}
            >
              {main.description}
            </div>
          )}
        </button>
      </div>

      {hasSubs && expanded && (
        <ul className="ml-[28px] flex flex-col gap-0.5 pb-1">
          {subs.map((sub, j) => (
            <li
              key={sub.id}
              className="relative pl-4"
            >
              <span
                className="absolute left-0 top-3 w-3 h-px bg-[var(--glass-border)]"
                aria-hidden
              />
              {j !== subs.length - 1 && (
                <span
                  className="absolute left-0 top-0 bottom-0 w-px bg-[var(--glass-border)]"
                  aria-hidden
                />
              )}
              <button
                type="button"
                onClick={() => onToggle(sub.id)}
                className="w-full flex items-center gap-2 text-left py-1 hover:text-[var(--text-primary)]"
              >
                <span
                  className={clsx(
                    "shrink-0 w-3.5 h-3.5 rounded border flex items-center justify-center text-[8px]",
                    sub.completed
                      ? "bg-white/15 border-white/30 text-[var(--text-primary)]"
                      : "border-[var(--glass-border)]"
                  )}
                >
                  {sub.completed && "✓"}
                </span>
                <span
                  className={clsx(
                    "text-[12px] flex-1",
                    sub.completed
                      ? "text-[var(--text-tertiary)] line-through"
                      : "text-[var(--text-secondary)]"
                  )}
                >
                  {sub.title}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
