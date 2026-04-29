"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

export interface InnerTabSpec<T extends string> {
  id: T;
  label: string;
  icon?: ReactNode;
}

interface InnerTabsProps<T extends string> {
  tabs: InnerTabSpec<T>[];
  active: T;
  onChange: (id: T) => void;
}

export function InnerTabs<T extends string>({
  tabs,
  active,
  onChange,
}: InnerTabsProps<T>) {
  return (
    <div
      className="flex items-center gap-1 px-2 py-2 overflow-x-auto scrollbar-hidden border-b border-[var(--glass-border)] shrink-0"
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={clsx(
              "px-3 h-8 rounded-md text-[11px] tracking-wide whitespace-nowrap transition-colors",
              "flex items-center gap-1.5",
              isActive
                ? "bg-[var(--glass-bg)] text-[var(--text-primary)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-white/5"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
