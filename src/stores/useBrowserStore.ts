"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SofiaTab =
  | "materials"
  | "workouts"
  | "exams"
  | "calculators"
  | "progress";

export type ProximaTab = "tasks" | "pipelines";

interface BrowserState {
  sofiaTab: SofiaTab;
  proximaTab: ProximaTab;
  setSofiaTab: (t: SofiaTab) => void;
  setProximaTab: (t: ProximaTab) => void;
}

export const useBrowserStore = create<BrowserState>()(
  persist(
    (set) => ({
      sofiaTab: "materials",
      proximaTab: "tasks",
      setSofiaTab: (sofiaTab) => set({ sofiaTab }),
      setProximaTab: (proximaTab) => set({ proximaTab }),
    }),
    { name: "mse:browser" }
  )
);
