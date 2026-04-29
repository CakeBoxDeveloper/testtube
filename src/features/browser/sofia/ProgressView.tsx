"use client";

import { useMemo, useState } from "react";
import { useStatsStore } from "@/stores/useStatsStore";
import { useHydrated } from "@/hooks/useHydrated";
import type { Achievement, WeightEntry } from "@/lib/types";
import { WeightEntryModal } from "./progress/WeightEntryModal";

export function ProgressView() {
  const hydrated = useHydrated();
  const weights = useStatsStore((s) => s.weights);
  const achievements = useStatsStore((s) => s.achievements);
  const removeWeight = useStatsStore((s) => s.removeWeight);
  const [open, setOpen] = useState(false);

  const visibleWeights: WeightEntry[] = hydrated ? weights : [];
  const visibleAchievements: Achievement[] = hydrated ? achievements : [];

  return (
    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 min-h-0">
      <Section
        title="Динамика веса"
        action={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="h-7 px-3 rounded-md border border-[var(--glass-border)] bg-white/5 hover:bg-white/10 text-[11px] text-[var(--text-primary)]"
          >
            + Замер
          </button>
        }
      >
        {visibleWeights.length === 0 ? (
          <Empty hint="Записей нет. Добавь первый замер." />
        ) : (
          <>
            <WeightChart entries={visibleWeights} />
            <WeightList entries={visibleWeights} onRemove={removeWeight} />
          </>
        )}
      </Section>

      <Section title="Достижения">
        {visibleAchievements.length === 0 ? (
          <Empty hint="Сдай экзамены и пройди материалы — здесь появятся ачивки." />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {visibleAchievements.map((a) => (
              <div
                key={a.id}
                className="p-3 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)]"
              >
                <div className="text-sm font-medium text-[var(--text-primary)]">
                  {a.title}
                </div>
                {a.description && (
                  <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                    {a.description}
                  </div>
                )}
                {a.unlockedAt && (
                  <div className="text-[10px] text-[var(--text-tertiary)] mt-1 tabular-nums">
                    {new Date(a.unlockedAt).toLocaleDateString("ru")}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      <WeightEntryModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] uppercase tracking-wide text-[var(--text-tertiary)]">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function Empty({ hint }: { hint: string }) {
  return (
    <div className="p-3 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[11px] text-[var(--text-tertiary)] text-center">
      {hint}
    </div>
  );
}

function WeightChart({ entries }: { entries: WeightEntry[] }) {
  const { points, min, max } = useMemo(() => {
    const sorted = [...entries].sort((a, b) => a.date - b.date);
    const ws = sorted.map((e) => e.weight);
    const min = Math.min(...ws);
    const max = Math.max(...ws);
    const range = Math.max(0.5, max - min);
    const pts = sorted.map((e, i) => {
      const x = sorted.length === 1 ? 50 : (i / (sorted.length - 1)) * 100;
      const y = 90 - ((e.weight - min) / range) * 70;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });
    return { points: pts.join(" "), min, max };
  }, [entries]);

  return (
    <div className="p-3 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)]">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-32">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          className="text-[var(--text-secondary)]"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="flex justify-between text-[10px] tabular-nums text-[var(--text-tertiary)]">
        <span>min {min.toFixed(1)} кг</span>
        <span>max {max.toFixed(1)} кг</span>
      </div>
    </div>
  );
}

function WeightList({
  entries,
  onRemove,
}: {
  entries: WeightEntry[];
  onRemove: (date: number) => void;
}) {
  const sorted = [...entries].sort((a, b) => b.date - a.date).slice(0, 6);
  return (
    <div className="flex flex-col gap-1">
      {sorted.map((e) => (
        <div
          key={e.date}
          className="flex items-center justify-between px-3 h-9 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)]"
        >
          <span className="text-[11px] text-[var(--text-tertiary)] tabular-nums">
            {new Date(e.date).toLocaleDateString("ru")}
          </span>
          <span className="text-sm tabular-nums text-[var(--text-primary)]">
            {e.weight.toFixed(1)} кг
          </span>
          <button
            type="button"
            onClick={() => onRemove(e.date)}
            aria-label="Удалить замер"
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-xs"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
