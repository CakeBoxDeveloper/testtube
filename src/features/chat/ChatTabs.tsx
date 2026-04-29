"use client";

import clsx from "clsx";
import { useChatStore } from "@/stores/useChatStore";
import type { ModuleId } from "@/lib/types";

interface ChatTabsProps {
  module: ModuleId;
}

export function ChatTabs({ module }: ChatTabsProps) {
  const tabs = useChatStore((s) => s.tabs);
  const order = useChatStore((s) => s.order);
  const activeId = useChatStore((s) => s.activeTabId[module]);
  const setActive = useChatStore((s) => s.setActive);
  const createTab = useChatStore((s) => s.createTab);
  const removeTab = useChatStore((s) => s.removeTab);

  const moduleTabs = order
    .map((id) => tabs[id])
    .filter((t) => t && t.module === module);

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 overflow-x-auto scrollbar-hidden border-b border-[var(--glass-border)] shrink-0">
      {moduleTabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <div
            key={tab.id}
            className={clsx(
              "flex items-center h-7 rounded-md px-2 gap-1 text-[11px] whitespace-nowrap transition-colors",
              isActive
                ? "bg-[var(--glass-bg)] text-[var(--text-primary)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-white/5"
            )}
          >
            <button
              type="button"
              onClick={() => setActive(module, tab.id)}
              className="max-w-[120px] truncate"
              title={tab.title}
            >
              {tab.title}
            </button>
            {!tab.base && (
              <button
                type="button"
                onClick={() => removeTab(tab.id)}
                aria-label="Закрыть чат"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-[10px] leading-none"
              >
                ✕
              </button>
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => createTab(module)}
        aria-label="Новый чат"
        className="shrink-0 h-7 w-7 rounded-md flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-white/5 text-sm"
      >
        +
      </button>
    </div>
  );
}
