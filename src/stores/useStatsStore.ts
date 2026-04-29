"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Achievement, WeightEntry } from "@/lib/types";

export interface ExamScore {
  examId: string;
  bestScore: number; // 0..100
  attempts: number;
  lastAt: number;
}

interface StatsSnapshot {
  weights: WeightEntry[];
  achievements: Achievement[];
  examScores: Record<string, ExamScore>;
}

interface StatsState extends StatsSnapshot {
  addWeight: (weight: number, date?: number) => void;
  removeWeight: (date: number) => void;
  unlockAchievement: (achievement: Achievement) => boolean;
  recordExamScore: (examId: string, score: number) => boolean; // true if new best
  hydrate: (snapshot: Partial<StatsSnapshot>) => void;
}

export type { StatsSnapshot };

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      weights: [],
      achievements: [],
      examScores: {},

      addWeight: (weight, date) =>
        set((s) => {
          const at = date ?? Date.now();
          const next = [...s.weights, { date: at, weight }].sort(
            (a, b) => a.date - b.date
          );
          return { weights: next };
        }),

      removeWeight: (date) =>
        set((s) => ({ weights: s.weights.filter((w) => w.date !== date) })),

      unlockAchievement: (achievement) => {
        const exists = get().achievements.some((a) => a.id === achievement.id);
        if (exists) return false;
        const enriched: Achievement = {
          ...achievement,
          id: achievement.id || makeId("ach"),
          unlockedAt: achievement.unlockedAt ?? Date.now(),
        };
        set((s) => ({ achievements: [...s.achievements, enriched] }));
        return true;
      },

      hydrate: (snapshot) =>
        set({
          weights: Array.isArray(snapshot.weights) ? snapshot.weights : [],
          achievements: Array.isArray(snapshot.achievements)
            ? snapshot.achievements
            : [],
          examScores:
            snapshot.examScores && typeof snapshot.examScores === "object"
              ? snapshot.examScores
              : {},
        }),

      recordExamScore: (examId, score) => {
        const prev = get().examScores[examId];
        const isBest = !prev || score > prev.bestScore;
        const next: ExamScore = {
          examId,
          bestScore: isBest ? score : prev.bestScore,
          attempts: (prev?.attempts ?? 0) + 1,
          lastAt: Date.now(),
        };
        set((s) => ({ examScores: { ...s.examScores, [examId]: next } }));
        return isBest;
      },
    }),
    { name: "mse:stats" }
  )
);
