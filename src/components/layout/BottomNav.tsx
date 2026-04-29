"use client";

import clsx from "clsx";
import { ICONS, LOTTIE } from "@/lib/assets";
import { Icon } from "@/components/ui/Icon";
import { useModuleStore } from "@/stores/useModuleStore";
import { useHydrated } from "@/hooks/useHydrated";
import type { ModuleId } from "@/lib/types";

interface NavItem {
  id: ModuleId;
  label: string;
  icon: string;
}

const ITEMS: NavItem[] = [
  { id: "proxima", label: "Проксима", icon: ICONS.note },
  { id: "sofia", label: "София", icon: ICONS.dashboard },
];

export function BottomNav() {
  const hydrated = useHydrated();
  const current = useModuleStore((s) => s.module);
  const setModule = useModuleStore((s) => s.setModule);

  return (
    <nav
      aria-label="Модули"
      className="lg:hidden flex items-center justify-around shrink-0 h-[58px] px-2 border-t border-[var(--glass-border)] bg-[var(--bg-panel)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
    >
      {ITEMS.map((item) => {
        const active = hydrated && current === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setModule(item.id)}
            className={clsx(
              "flex-1 h-full flex flex-col items-center justify-center gap-0.5 rounded-md transition-colors",
              active ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]",
              "hover:bg-white/5 active:bg-white/10"
            )}
            aria-pressed={active}
          >
            <Icon
              src={item.icon}
              size={18}
              tinted
              style={active ? { opacity: 1 } : { opacity: 0.55 }}
            />
            <span className="text-[10px] tracking-wide">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// Decorative — not exposed in nav UI yet but kept for future Lottie loader use.
export const _LOTTIE_PROXIMA = LOTTIE.proxima;
