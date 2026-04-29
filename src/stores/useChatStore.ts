"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatMessage, ChatTab, ModuleId } from "@/lib/types";

const BASE_IDS: Record<ModuleId, string> = {
  sofia: "base_sofia",
  proxima: "base_proxima",
};

const BASE_TITLES: Record<ModuleId, string> = {
  sofia: "София",
  proxima: "Проксима",
};

const BASE_GREETING: Record<ModuleId, string> = {
  sofia:
    "Привет, я София. Спрашивай о здоровье, тренировках, питании — помогу разобраться.",
  proxima:
    "Я Проксима. Опиши задачу — разобью на шаги, выставлю приоритет и дедлайн.",
};

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

interface ChatState {
  tabs: Record<string, ChatTab>;
  order: string[];
  activeTabId: Record<ModuleId, string | null>;
  sending: Record<string, boolean>;

  ensureBaseTabs: () => void;
  createTab: (module: ModuleId, title?: string) => string;
  removeTab: (id: string) => void;
  renameTab: (id: string, title: string) => void;
  pinTab: (id: string, pinned: boolean) => void;
  setActive: (module: ModuleId, id: string) => void;
  appendMessage: (tabId: string, msg: ChatMessage) => void;
  setSending: (tabId: string, value: boolean) => void;
  clearTab: (tabId: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      tabs: {},
      order: [],
      activeTabId: { sofia: null, proxima: null },
      sending: {},

      ensureBaseTabs: () => {
        const { tabs, order, activeTabId } = get();
        const patch: Partial<ChatState> = {};
        const nextTabs = { ...tabs };
        const nextOrder = [...order];
        const nextActive = { ...activeTabId };
        let dirty = false;

        for (const m of ["sofia", "proxima"] as ModuleId[]) {
          const id = BASE_IDS[m];
          if (!nextTabs[id]) {
            nextTabs[id] = {
              id,
              module: m,
              title: BASE_TITLES[m],
              base: true,
              pinned: true,
              createdAt: Date.now(),
              messages: [{ role: "ai", text: BASE_GREETING[m] }],
            };
            if (!nextOrder.includes(id)) nextOrder.unshift(id);
            dirty = true;
          }
          if (!nextActive[m]) {
            nextActive[m] = id;
            dirty = true;
          }
        }
        if (dirty) {
          patch.tabs = nextTabs;
          patch.order = nextOrder;
          patch.activeTabId = nextActive;
          set(patch);
        }
      },

      createTab: (module, title) => {
        const id = makeId("chat");
        const tab: ChatTab = {
          id,
          module,
          title: title?.trim() || "Новый чат",
          createdAt: Date.now(),
          messages: [],
        };
        set((s) => ({
          tabs: { ...s.tabs, [id]: tab },
          order: [...s.order, id],
          activeTabId: { ...s.activeTabId, [module]: id },
        }));
        return id;
      },

      removeTab: (id) =>
        set((state) => {
          const tab = state.tabs[id];
          if (!tab || tab.base) return state;
          const tabs = { ...state.tabs };
          delete tabs[id];
          const order = state.order.filter((x) => x !== id);
          const activeTabId = { ...state.activeTabId };
          if (activeTabId[tab.module] === id) {
            activeTabId[tab.module] = BASE_IDS[tab.module];
          }
          const sending = { ...state.sending };
          delete sending[id];
          return { tabs, order, activeTabId, sending };
        }),

      renameTab: (id, title) =>
        set((state) => {
          const tab = state.tabs[id];
          if (!tab) return state;
          return {
            tabs: { ...state.tabs, [id]: { ...tab, title: title.trim() || tab.title } },
          };
        }),

      pinTab: (id, pinned) =>
        set((state) => {
          const tab = state.tabs[id];
          if (!tab) return state;
          return {
            tabs: { ...state.tabs, [id]: { ...tab, pinned } },
          };
        }),

      setActive: (module, id) =>
        set((state) => ({
          activeTabId: { ...state.activeTabId, [module]: id },
        })),

      appendMessage: (tabId, msg) =>
        set((state) => {
          const tab = state.tabs[tabId];
          if (!tab) return state;
          return {
            tabs: {
              ...state.tabs,
              [tabId]: { ...tab, messages: [...tab.messages, msg] },
            },
          };
        }),

      setSending: (tabId, value) =>
        set((state) => {
          const sending = { ...state.sending };
          if (value) sending[tabId] = true;
          else delete sending[tabId];
          return { sending };
        }),

      clearTab: (tabId) =>
        set((state) => {
          const tab = state.tabs[tabId];
          if (!tab) return state;
          const initial = tab.base
            ? [{ role: "ai" as const, text: BASE_GREETING[tab.module] }]
            : [];
          return {
            tabs: { ...state.tabs, [tabId]: { ...tab, messages: initial } },
          };
        }),
    }),
    {
      name: "mse:chat",
      partialize: (s) => ({
        tabs: s.tabs,
        order: s.order,
        activeTabId: s.activeTabId,
      }),
    }
  )
);

export const CHAT_BASE_IDS = BASE_IDS;
