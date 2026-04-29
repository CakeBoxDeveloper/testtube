"use client";

import clsx from "clsx";
import { useState } from "react";
import {
  PRIORITY_LABEL,
  useTasksStore,
} from "@/stores/useTasksStore";
import type { Priority } from "@/lib/types";
import { ICONS } from "@/lib/assets";
import { Icon } from "@/components/ui/Icon";
import { proximaApi } from "@/lib/proxima-api";
import { parsePipeline } from "@/lib/pipeline";

const PRIORITIES: Priority[] = ["low", "medium", "high", "critical"];

export function TaskCreateForm() {
  const setCreating = useTasksStore((s) => s.setCreating);
  const create = useTasksStore((s) => s.create);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stepDraft, setStepDraft] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [priority, setPriority] = useState<Priority>("medium");
  const [deadline, setDeadline] = useState<string>("");
  const [pipeline, setPipeline] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const generatePipeline = async () => {
    if (!title.trim() || aiBusy) return;
    setAiBusy(true);
    setAiError(null);
    try {
      const deadlineHours = deadline
        ? Math.max(
            0,
            Math.round(
              (new Date(deadline).getTime() - Date.now()) / 3600_000
            )
          )
        : undefined;
      const res = await proximaApi.generatePipeline({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        deadlineHours,
      });
      setPipeline(res.pipeline);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Ошибка генерации");
    } finally {
      setAiBusy(false);
    }
  };

  const submit = () => {
    if (!title.trim()) return;
    create({
      title: title.trim(),
      description: description.trim() || undefined,
      pipeline: pipeline ?? undefined,
      steps: pipeline ? undefined : steps,
      priority,
      deadline: deadline ? new Date(deadline).getTime() : null,
    });
  };

  const previewSteps = pipeline ? parsePipeline(pipeline) : null;

  return (
    <div className="flex flex-col gap-3 p-3 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)]">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--text-primary)]">
          Новая задача
        </span>
        <button
          type="button"
          onClick={() => setCreating(false)}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-sm"
        >
          ✕
        </button>
      </div>

      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Название"
        className="px-3 h-10 rounded-md border border-[var(--glass-border)] bg-black/20 outline-none text-sm"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Описание (опционально)"
        rows={2}
        className="px-3 py-2 rounded-md border border-[var(--glass-border)] bg-black/20 outline-none text-sm resize-none"
      />

      <div className="flex flex-col gap-1">
        <span className="text-[11px] text-[var(--text-tertiary)]">Приоритет</span>
        <div className="grid grid-cols-4 gap-1">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={clsx(
                "h-8 rounded-md text-[10px] border border-[var(--glass-border)]",
                priority === p
                  ? "bg-white/10 text-[var(--text-primary)]"
                  : "bg-black/20 text-[var(--text-tertiary)]"
              )}
            >
              {PRIORITY_LABEL[p]}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-[11px] text-[var(--text-tertiary)]">Дедлайн</span>
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="px-3 h-10 rounded-md border border-[var(--glass-border)] bg-black/20 outline-none text-sm"
        />
      </label>

      {/* AI pipeline generation */}
      <div className="flex flex-col gap-2 p-2.5 rounded-md border border-[var(--glass-border)] bg-black/15">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[var(--text-tertiary)]">
            Шаги (pipeline)
          </span>
          <button
            type="button"
            onClick={generatePipeline}
            disabled={!title.trim() || aiBusy}
            className="h-7 px-2.5 rounded-md text-[11px] border border-[var(--glass-border)] bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none"
          >
            {aiBusy ? "Генерирую…" : pipeline ? "✨ Перегенерировать" : "✨ ИИ pipeline"}
          </button>
        </div>
        {aiError && (
          <div className="text-[11px] text-red-400 px-1">{aiError}</div>
        )}

        {previewSteps && previewSteps.length > 0 ? (
          <div className="flex flex-col gap-2">
            <ol className="text-[12px] text-[var(--text-primary)] flex flex-col gap-1.5 max-h-[280px] overflow-y-auto">
              {previewSteps.map((s, i) => (
                <li key={i} className="pl-1">
                  <div className="flex gap-2">
                    <span className="text-[var(--text-tertiary)] tabular-nums">
                      {i + 1}.
                    </span>
                    <span className="font-medium">{s.title}</span>
                  </div>
                  {s.description && (
                    <div className="text-[11px] text-[var(--text-tertiary)] pl-5 mt-0.5 whitespace-pre-line">
                      {s.description}
                    </div>
                  )}
                  {s.substeps.length > 0 && (
                    <ul className="pl-5 mt-1 text-[11px] text-[var(--text-secondary)] space-y-0.5">
                      {s.substeps.map((sub, j) => (
                        <li key={j}>· {sub.title}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => setPipeline(null)}
              className="self-end text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              Очистить pipeline
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {steps.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 h-9 rounded-md bg-black/20 border border-[var(--glass-border)]"
              >
                <span className="text-[10px] text-[var(--text-tertiary)] tabular-nums w-4">
                  {i + 1}
                </span>
                <span className="flex-1 text-xs text-[var(--text-primary)] truncate">
                  {s}
                </span>
                <button
                  type="button"
                  onClick={() => setSteps(steps.filter((_, j) => j !== i))}
                  aria-label="Удалить шаг"
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                >
                  <Icon src={ICONS.delete} size={12} />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-1">
              <input
                value={stepDraft}
                onChange={(e) => setStepDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && stepDraft.trim()) {
                    e.preventDefault();
                    setSteps([...steps, stepDraft.trim()]);
                    setStepDraft("");
                  }
                }}
                placeholder="Добавить шаг и Enter"
                className="flex-1 px-3 h-9 rounded-md border border-[var(--glass-border)] bg-black/20 outline-none text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (stepDraft.trim()) {
                    setSteps([...steps, stepDraft.trim()]);
                    setStepDraft("");
                  }
                }}
                className="h-9 px-3 rounded-md bg-white/5 hover:bg-white/10 text-xs"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setCreating(false)}
          className="flex-1 h-9 rounded-md border border-[var(--glass-border)] text-xs text-[var(--text-secondary)]"
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={!title.trim()}
          className="flex-1 h-9 rounded-md bg-white/10 text-xs text-[var(--text-primary)] disabled:opacity-40"
        >
          Создать
        </button>
      </div>
    </div>
  );
}
