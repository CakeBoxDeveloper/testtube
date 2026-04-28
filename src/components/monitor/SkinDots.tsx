"use client";

import clsx from "clsx";
import { MONITOR_SKINS, useMonitorStore } from "@/stores/useMonitorStore";
import type { MonitorSkin } from "@/lib/types";

const LABEL: Record<MonitorSkin, string> = {
  heat: "Heat",
  xray: "X-Ray",
  grid: "Grid",
};

export function SkinDots() {
  const skin = useMonitorStore((s) => s.skin);
  const setSkin = useMonitorStore((s) => s.setSkin);

  return (
    <div className="flex items-center gap-1.5">
      {MONITOR_SKINS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => setSkin(s)}
          aria-label={LABEL[s]}
          title={LABEL[s]}
          className={clsx(
            "rounded-full transition-all",
            s === skin
              ? "w-4 h-1.5 bg-[var(--text-primary)]"
              : "w-1.5 h-1.5 bg-[var(--text-tertiary)] hover:bg-[var(--text-secondary)]"
          )}
        />
      ))}
    </div>
  );
}
