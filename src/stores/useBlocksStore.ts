"use client";

import { create } from "zustand";

type BlockId = "browser" | "chat";

interface BlocksState {
  collapsed: Record<BlockId, boolean>;
  toggle: (id: BlockId) => void;
  setCollapsed: (id: BlockId, value: boolean) => void;
  bothCollapsed: () => boolean;
}

export const useBlocksStore = create<BlocksState>((set, get) => ({
  collapsed: { browser: false, chat: false },
  toggle: (id) =>
    set((s) => ({ collapsed: { ...s.collapsed, [id]: !s.collapsed[id] } })),
  setCollapsed: (id, value) =>
    set((s) => ({ collapsed: { ...s.collapsed, [id]: value } })),
  bothCollapsed: () => {
    const c = get().collapsed;
    return c.browser && c.chat;
  },
}));
