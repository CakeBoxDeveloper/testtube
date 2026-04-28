"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  loginDate: number | null;
  setUser: (u: User | null) => void;
  setLoginDate: (d: number | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loginDate: null,
      setUser: (user) => set({ user }),
      setLoginDate: (loginDate) => set({ loginDate }),
      logout: () => set({ user: null, loginDate: null }),
    }),
    { name: "mse:auth" }
  )
);
