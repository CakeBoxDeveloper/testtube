"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { proximaApi } from "@/lib/proxima-api";
import {
  PRIORITY_LABEL,
  useTasksStore,
} from "@/stores/useTasksStore";
import type { ParsedTask } from "@/lib/ai/parse-task";
import { parsePipeline } from "@/lib/pipeline";
import { VoiceButton } from "@/components/ui/VoiceButton";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AiTaskQuickModal({ open, onClose }: Props) {
  const create = useTasksStore((s) => s.create);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<ParsedTask | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stub, setStub] = useState(false);

  const reset = () => {
    setText("");
    setPreview(null);
    setError(null);
    setStub(false);
    setBusy(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const generate = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await proximaApi.enhance(text.trim());
      setPreview(res.task);
      setStub(!!res.stub);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка генерации";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const accept = () => {
    if (!preview) return;
    const deadline =
      preview.deadlineHours && preview.deadlineHours > 0
        ? Date.now() + preview.deadlineHours * 3600_000
        : null;
    create({
      title: preview.title,
      description: preview.description,
      pipeline: preview.pipeline,
      steps: preview.pipeline ? undefined : preview.steps,
      priority: preview.priority,
      deadline,
    });
    close();
  };

  const previewSteps = preview?.pipeline
    ? parsePipeline(preview.pipeline)
    : null;

  return (
    <Modal
      open={open}
      onClose={busy ? undefined : close}
      className="!max-w-[440px] !p-0"
    >
      <div className="p-5 flex flex-col gap-3 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between sticky top-0 bg-[var(--bg-elevated)] -mx-5 px-5 -mt-5 pt-5 pb-2 z-10">
          <span className="text-[11px] uppercase tracking-wide text-[var(--text-tertiary)]">
            Создать задачу через ИИ
          </span>
          <button
            type="button"
            onClick={close}
            disabled={busy}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-sm disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {!preview && (
          <>
            <div className="relative">
              <textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Опиши задачу свободным текстом или продиктуй голосом."
                rows={5}
                className="w-full px-3 py-2 pr-12 rounded-md border border-[var(--glass-border)] bg-black/20 outline-none text-sm resize-none"
              />
              <div className="absolute bottom-2 right-2">
                <VoiceButton
                  size={32}
                  disabled={busy}
                  onText={(spoken) =>
                    setText((prev) => {
                      const sep = prev && !/[\s\n]$/.test(prev) ? " " : "";
                      return prev + sep + spoken;
                    })
                  }
                  onError={(msg) => setError(msg)}
                />
              </div>
            </div>
            {error && (
              <div className="text-[11px] text-red-400 px-1">{error}</div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={close}
                disabled={busy}
                className="flex-1 h-10 rounded-md border border-[var(--glass-border)] text-sm text-[var(--text-secondary)] disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={generate}
                disabled={busy || !text.trim()}
                className="flex-1 h-10 rounded-md bg-white/10 hover:bg-white/15 text-sm text-[var(--text-primary)] disabled:opacity-40"
              >
                {busy ? "Генерирую…" : "Сгенерировать"}
              </button>
            </div>
          </>
        )}

        {preview && (
          <>
            {stub && (
              <div className="text-[10px] text-[var(--text-tertiary)] p-2 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                Stub: GEMINI_API_KEY не задан — это заглушка. Добавь ключ в .env.local.
              </div>
            )}
            <div className="flex flex-col gap-2 p-3 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)]">
              <div className="text-sm font-medium text-[var(--text-primary)]">
                {preview.title}
              </div>
              {preview.description && (
                <div className="text-[12px] text-[var(--text-secondary)]">
                  {preview.description}
                </div>
              )}
              <div className="flex gap-3 flex-wrap text-[11px] text-[var(--text-tertiary)] mt-1">
                <span>Приоритет: {PRIORITY_LABEL[preview.priority]}</span>
                {preview.deadlineHours && (
                  <span>Срок: ~{preview.deadlineHours} ч.</span>
                )}
              </div>

              {previewSteps && previewSteps.length > 0 ? (
                <ol className="text-[12px] text-[var(--text-primary)] mt-2 flex flex-col gap-2">
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
                            <li key={j} className="flex gap-1">
                              <span className="text-[var(--text-tertiary)]">
                                ·
                              </span>
                              <span>{sub.title}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                preview.steps.length > 0 && (
                  <ol className="list-decimal pl-5 text-[12px] text-[var(--text-primary)] space-y-0.5 mt-1">
                    {preview.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                )
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setError(null);
                }}
                className="flex-1 h-10 rounded-md border border-[var(--glass-border)] text-sm text-[var(--text-secondary)]"
              >
                Заново
              </button>
              <button
                type="button"
                onClick={accept}
                className="flex-1 h-10 rounded-md bg-white/10 hover:bg-white/15 text-sm text-[var(--text-primary)]"
              >
                Создать задачу
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
