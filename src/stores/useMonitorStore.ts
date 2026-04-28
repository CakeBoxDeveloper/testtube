"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MonitorSkin } from "@/lib/types";

const SKIN_ORDER: MonitorSkin[] = ["heat", "xray", "grid"];

interface Vitals {
  bIndex: number;
  pulse: number;
  hrr: number;
  oxygen: number;
}

const ZERO_VITALS: Vitals = { bIndex: 0, pulse: 0, hrr: 0, oxygen: 0 };

function rng(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min));
}

function generateVitals(): Vitals {
  return {
    bIndex: rng(48, 92),
    pulse: rng(58, 84),
    hrr: rng(28, 60),
    oxygen: rng(95, 99),
  };
}

interface MonitorState {
  skin: MonitorSkin;
  vitals: Vitals;
  vitalsReady: boolean;
  cycleSkin: () => void;
  setSkin: (s: MonitorSkin) => void;
  refreshVitals: () => void;
  ensureVitals: () => void;
}

export const useMonitorStore = create<MonitorState>()(
  persist(
    (set, get) => ({
      skin: "heat",
      // Deterministic on both server and client. Real values populated
      // after mount via ensureVitals() to avoid SSR hydration mismatch.
      vitals: ZERO_VITALS,
      vitalsReady: false,
      cycleSkin: () => {
        const i = SKIN_ORDER.indexOf(get().skin);
        set({ skin: SKIN_ORDER[(i + 1) % SKIN_ORDER.length] });
      },
      setSkin: (skin) => set({ skin }),
      refreshVitals: () => set({ vitals: generateVitals(), vitalsReady: true }),
      ensureVitals: () => {
        if (!get().vitalsReady) {
          set({ vitals: generateVitals(), vitalsReady: true });
        }
      },
    }),
    { name: "mse:monitor", partialize: (s) => ({ skin: s.skin }) }
  )
);

export const MONITOR_SKINS = SKIN_ORDER;
