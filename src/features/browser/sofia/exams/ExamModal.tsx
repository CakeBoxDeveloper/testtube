"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "@/components/ui/Modal";
import { useStatsStore } from "@/stores/useStatsStore";
import type { ExamSpec } from "./exam-data";

interface ExamModalProps {
  spec: ExamSpec | null;
  onClose: () => void;
}

interface AnswerLog {
  questionId: string;
  selected: number;
  correct: number;
}

export function ExamModal({ spec, onClose }: ExamModalProps) {
  return (
    <Modal
      open={!!spec}
      onClose={onClose}
      closeOnBackdrop={false}
      className="!max-w-[480px] !w-[calc(100%-24px)] !p-0 overflow-hidden"
    >
      {spec && <ExamFlow spec={spec} onClose={onClose} />}
    </Modal>
  );
}

function ExamFlow({ spec, onClose }: { spec: ExamSpec; onClose: () => void }) {
  const recordExamScore = useStatsStore((s) => s.recordExamScore);
  const unlockAchievement = useStatsStore((s) => s.unlockAchievement);

  const [stage, setStage] = useState<"intro" | "quiz" | "results">("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerLog[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(spec.durationMin * 60);

  useEffect(() => {
    if (stage !== "quiz") return;
    if (secondsLeft <= 0) {
      finish();
      return;
    }
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, secondsLeft]);

  const finish = () => {
    const correct = answers.filter((a) => a.selected === a.correct).length;
    const total = spec.questions.length;
    const score = Math.round((correct / total) * 100);
    recordExamScore(spec.id, score);
    if (score >= spec.passScore) {
      unlockAchievement({
        id: spec.awardId,
        title: spec.awardTitle,
        description: spec.awardDescription,
      });
    }
    setStage("results");
  };

  const onAnswer = (selected: number) => {
    const q = spec.questions[index];
    const log: AnswerLog = {
      questionId: q.id,
      selected,
      correct: q.correct,
    };
    const next = [...answers, log];
    setAnswers(next);
    if (index + 1 >= spec.questions.length) {
      // small delay to show selection feedback
      setTimeout(() => {
        const correct = next.filter((a) => a.selected === a.correct).length;
        const score = Math.round((correct / spec.questions.length) * 100);
        recordExamScore(spec.id, score);
        if (score >= spec.passScore) {
          unlockAchievement({
            id: spec.awardId,
            title: spec.awardTitle,
            description: spec.awardDescription,
          });
        }
        setStage("results");
      }, 250);
    } else {
      setTimeout(() => setIndex(index + 1), 250);
    }
  };

  if (stage === "intro") {
    return (
      <ExamIntro
        spec={spec}
        onStart={() => setStage("quiz")}
        onClose={onClose}
      />
    );
  }
  if (stage === "results") {
    return (
      <ExamResults
        spec={spec}
        answers={answers}
        onClose={onClose}
        onRetry={() => {
          setAnswers([]);
          setIndex(0);
          setSecondsLeft(spec.durationMin * 60);
          setStage("quiz");
        }}
      />
    );
  }
  return (
    <ExamQuestion
      spec={spec}
      index={index}
      secondsLeft={secondsLeft}
      lastAnswer={answers[answers.length - 1]?.questionId === spec.questions[index].id ? answers[answers.length - 1] : null}
      onAnswer={onAnswer}
      onAbort={onClose}
    />
  );
}

function ExamIntro({
  spec,
  onStart,
  onClose,
}: {
  spec: ExamSpec;
  onStart: () => void;
  onClose: () => void;
}) {
  return (
    <div className="p-5 flex flex-col gap-3">
      <div className="text-[11px] uppercase tracking-wide text-[var(--text-tertiary)]">
        Экзамен
      </div>
      <h3 className="text-lg font-medium text-[var(--text-primary)]">{spec.title}</h3>
      <p className="text-sm text-[var(--text-secondary)]">{spec.description}</p>
      <ul className="text-[12px] text-[var(--text-tertiary)] space-y-1 mt-1">
        <li>• Вопросов: {spec.questions.length}</li>
        <li>• Время: {spec.durationMin} мин</li>
        <li>• Проходной балл: {spec.passScore}%</li>
      </ul>
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-10 rounded-md border border-[var(--glass-border)] text-sm text-[var(--text-secondary)]"
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={onStart}
          className="flex-1 h-10 rounded-md bg-white/10 hover:bg-white/15 text-sm text-[var(--text-primary)]"
        >
          Начать
        </button>
      </div>
    </div>
  );
}

function formatMSS(s: number) {
  const m = Math.max(0, Math.floor(s / 60));
  const r = Math.max(0, s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function ExamQuestion({
  spec,
  index,
  secondsLeft,
  lastAnswer,
  onAnswer,
  onAbort,
}: {
  spec: ExamSpec;
  index: number;
  secondsLeft: number;
  lastAnswer: AnswerLog | null;
  onAnswer: (i: number) => void;
  onAbort: () => void;
}) {
  const q = spec.questions[index];
  const total = spec.questions.length;
  const progress = ((index + (lastAnswer ? 1 : 0)) / total) * 100;

  return (
    <div className="flex flex-col h-[min(620px,90vh)]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--glass-border)] shrink-0">
        <span className="text-[11px] text-[var(--text-tertiary)]">
          {index + 1} / {total}
        </span>
        <span className="text-[11px] tabular-nums text-[var(--text-tertiary)]">
          {formatMSS(secondsLeft)}
        </span>
        <button
          type="button"
          onClick={onAbort}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-sm"
          aria-label="Закрыть"
        >
          ✕
        </button>
      </div>
      <div className="h-0.5 bg-white/5">
        <div
          className="h-full bg-[var(--text-secondary)] transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -30, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col gap-3"
          >
            <h4 className="text-base font-medium text-[var(--text-primary)] leading-snug">
              {q.text}
            </h4>
            <div className="flex flex-col gap-2 mt-2">
              {q.options.map((opt, i) => {
                const isSelected = lastAnswer?.selected === i;
                const isCorrect = lastAnswer && i === q.correct;
                const isWrongPick = lastAnswer && isSelected && i !== q.correct;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!!lastAnswer}
                    onClick={() => onAnswer(i)}
                    className={clsx(
                      "px-4 py-3 rounded-lg border text-left text-sm transition-colors",
                      "border-[var(--glass-border)] bg-[var(--glass-bg)]",
                      "hover:bg-white/5 active:bg-white/10",
                      "disabled:cursor-default",
                      lastAnswer && isCorrect && "!bg-green-500/15 !border-green-500/30",
                      isWrongPick && "!bg-red-500/15 !border-red-500/30"
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ExamResults({
  spec,
  answers,
  onClose,
  onRetry,
}: {
  spec: ExamSpec;
  answers: AnswerLog[];
  onClose: () => void;
  onRetry: () => void;
}) {
  const correct = useMemo(
    () => answers.filter((a) => a.selected === a.correct).length,
    [answers]
  );
  const total = spec.questions.length;
  const score = Math.round((correct / total) * 100);
  const passed = score >= spec.passScore;

  return (
    <div className="p-5 flex flex-col gap-4">
      <div
        className={clsx(
          "rounded-lg p-4 text-center border",
          passed
            ? "border-green-500/30 bg-green-500/10"
            : "border-[var(--glass-border)] bg-[var(--glass-bg)]"
        )}
      >
        <div className="text-[11px] uppercase tracking-wide text-[var(--text-tertiary)]">
          {passed ? "Экзамен сдан" : "Экзамен не сдан"}
        </div>
        <div className="text-3xl font-semibold tabular-nums text-[var(--text-primary)] mt-1">
          {score}%
        </div>
        <div className="text-[11px] text-[var(--text-tertiary)] mt-1">
          {correct} из {total} • проходной {spec.passScore}%
        </div>
        {passed && (
          <div className="mt-3 text-[12px] text-[var(--text-secondary)]">
            Достижение: <strong className="text-[var(--text-primary)]">{spec.awardTitle}</strong>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onRetry}
          className="flex-1 h-10 rounded-md border border-[var(--glass-border)] text-sm text-[var(--text-secondary)]"
        >
          Заново
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-10 rounded-md bg-white/10 hover:bg-white/15 text-sm text-[var(--text-primary)]"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
