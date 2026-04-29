"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ModuleId } from "@/lib/types";

interface ModuleState {
  module: ModuleId;
  setModule: (m: ModuleId) => void;
  toggle: () => void;
}

export const useModuleStore = create<ModuleState>()(
  persist(
    (set, get) => ({
      module: "sofia",
      setModule: (module) => set({ module }),
      toggle: () =>
        set({ module: get().module === "sofia" ? "proxima" : "sofia" }),
    }),
    { name: "mse:module" }
  )
);
