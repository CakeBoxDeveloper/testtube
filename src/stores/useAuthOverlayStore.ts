"use client";

import { create } from "zustand";

export type AuthMode = "login" | "register" | "logout";

interface AuthOverlayState {
  open: boolean;
  mode: AuthMode;
  show: (mode: AuthMode) => void;
  close: () => void;
  setMode: (mode: AuthMode) => void;
}

export const useAuthOverlayStore = create<AuthOverlayState>((set) => ({
  open: false,
  mode: "login",
  show: (mode) => set({ open: true, mode }),
  close: () => set({ open: false }),
  setMode: (mode) => set({ mode }),
}));
