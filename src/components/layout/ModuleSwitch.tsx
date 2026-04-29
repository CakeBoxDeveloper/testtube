"use client";

import clsx from "clsx";
import { useModuleStore } from "@/stores/useModuleStore";
import { useHydrated } from "@/hooks/useHydrated";
import type { ModuleId } from "@/lib/types";

const ITEMS: { id: ModuleId; label: string; short: string }[] = [
  { id: "proxima", label: "Проксима", short: "PRX" },
  { id: "sofia", label: "София", short: "SOF" },
];

export function ModuleSwitch() {
  const hydrated = useHydrated();
  const current = useModuleStore((s) => s.module);
  const setModule = useModuleStore((s) => s.setModule);
  const active = hydrated ? current : "sofia";

  return (
    <div
      role="tablist"
      aria-label="Модули"
      className="inline-flex items-center h-7 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)] p-0.5 gap-0.5"
    >
      {ITEMS.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setModule(item.id)}
            className={clsx(
              "h-6 px-2.5 rounded text-[10px] tracking-wide whitespace-nowrap transition-colors",
              isActive
                ? "bg-white/10 text-[var(--text-primary)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            )}
          >
            <span className="hidden sm:inline">{item.label}</span>
            <span className="sm:hidden">{item.short}</span>
          </button>
        );
      })}
    </div>
  );
}
