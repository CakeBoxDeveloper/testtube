"use client";

import clsx from "clsx";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { ICONS } from "@/lib/assets";
import { ExamModal } from "./exams/ExamModal";
import { EXAM_SPECS, type ExamSpec } from "./exams/exam-data";
import { useStatsStore } from "@/stores/useStatsStore";
import { useHydrated } from "@/hooks/useHydrated";

interface ExamCardData extends ExamSpec {
  locked?: boolean;
}

const EXAMS: ExamCardData[] = [
  EXAM_SPECS.exam_basics,
  EXAM_SPECS.exam_nutrition,
  {
    id: "exam_advanced",
    title: "Продвинутый блок",
    description: "Доступен после прохождения базового.",
    durationMin: 15,
    passScore: 80,
    awardId: "ach_exam_advanced",
    awardTitle: "Магистр",
    questions: [],
    locked: true,
  },
];

export function ExamsView() {
  const hydrated = useHydrated();
  const [activeId, setActiveId] = useState<string | null>(null);
  const examScores = useStatsStore((s) => s.examScores);

  const active = activeId ? EXAM_SPECS[activeId] : null;

  return (
    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-0">
      {EXAMS.map((exam) => {
        const score = hydrated ? examScores[exam.id] : undefined;
        return (
          <button
            key={exam.id}
            type="button"
            disabled={!!exam.locked}
            onClick={() => setActiveId(exam.id)}
            className={clsx(
              "w-full flex items-center gap-3 p-3 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-left transition-colors",
              "hover:bg-white/5 active:bg-white/10",
              exam.locked && "opacity-60 cursor-not-allowed"
            )}
          >
            <div className="shrink-0 w-10 h-10 rounded-md bg-black/20 flex items-center justify-center">
              <Icon
                src={exam.locked ? ICONS.padlock : ICONS.puzzle}
                size={18}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[var(--text-primary)]">
                {exam.title}
              </div>
              <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                {exam.description}
              </div>
              {score && !exam.locked && (
                <div className="text-[10px] text-[var(--text-secondary)] mt-1 tabular-nums">
                  лучший {score.bestScore}% · попыток {score.attempts}
                </div>
              )}
            </div>
            <div className="text-[10px] text-[var(--text-tertiary)] tabular-nums text-right">
              <div>{exam.questions.length || "—"} вопр.</div>
              <div>~{exam.durationMin} мин</div>
            </div>
          </button>
        );
      })}

      <ExamModal spec={active} onClose={() => setActiveId(null)} />
    </div>
  );
}
