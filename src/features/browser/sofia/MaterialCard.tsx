"use client";

import clsx from "clsx";
import { Icon } from "@/components/ui/Icon";
import { ICONS } from "@/lib/assets";
import type { MaterialItem } from "@/lib/types";

interface MaterialCardProps {
  item: MaterialItem;
  onClick?: () => void;
}

export function MaterialCard({ item, onClick }: MaterialCardProps) {
  const locked = item.locked && !item.purchased;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className={clsx(
        "w-full flex items-start gap-3 p-3 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-left transition-colors",
        "hover:bg-white/5 active:bg-white/10",
        locked && "opacity-60 cursor-not-allowed"
      )}
    >
      <div className="shrink-0 w-10 h-10 rounded-md bg-black/20 flex items-center justify-center">
        <Icon src={item.icon ?? ICONS.defaultMaterial} size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--text-primary)] truncate">
            {item.title}
          </span>
          {locked && (
            <Icon src={ICONS.padlock} size={11} style={{ opacity: 0.6 }} />
          )}
        </div>
        {item.description && (
          <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 line-clamp-2">
            {item.description}
          </p>
        )}
        {typeof item.progress === "number" && !locked && (
          <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-[var(--text-secondary)]"
              style={{ width: `${Math.max(0, Math.min(100, item.progress))}%` }}
            />
          </div>
        )}
      </div>
    </button>
  );
}
