"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Theme } from "@/lib/types";

interface ThemeState {
  theme: Theme;
  setTheme: (t: Theme) => void;
  cycle: () => void;
}

const order: Theme[] = ["dark", "light", "auto"];

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      setTheme: (theme) => set({ theme }),
      cycle: () => {
        const i = order.indexOf(get().theme);
        set({ theme: order[(i + 1) % order.length] });
      },
    }),
    { name: "mse:theme" }
  )
);

export function resolveTheme(theme: Theme): "dark" | "light" {
  if (theme !== "auto") return theme;
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}
