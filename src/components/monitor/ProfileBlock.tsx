"use client";

import { useEffect, useRef, useState } from "react";
import { useMonitorStore } from "@/stores/useMonitorStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useHydrated } from "@/hooks/useHydrated";

interface VitalRowProps {
  label: string;
  value: string | number;
  unit?: string;
}

function VitalRow({ label, value, unit }: VitalRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
        {label}
      </span>
      <span className="text-sm font-medium text-[var(--text-primary)] tabular-nums">
        {value}
        {unit && (
          <span className="text-[10px] text-[var(--text-tertiary)] ml-0.5">
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}

export function ProfileBlock() {
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const vitals = useMonitorStore((s) => s.vitals);
  const vitalsReady = useMonitorStore((s) => s.vitalsReady);
  const ensureVitals = useMonitorStore((s) => s.ensureVitals);

  useEffect(() => {
    ensureVitals();
  }, [ensureVitals]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [topFade, setTopFade] = useState(0);
  const [botFade, setBotFade] = useState(1);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      const top = el.scrollTop > 4 ? 1 : 0;
      const bot =
        el.scrollHeight - el.clientHeight - el.scrollTop > 4 ? 1 : 0;
      setTopFade(top);
      setBotFade(bot);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const dash = (n: number, fallback = "—") => (vitalsReady ? n : fallback);

  return (
    <div className="relative w-full">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-10 z-10 transition-opacity"
        style={{
          opacity: topFade,
          background:
            "linear-gradient(to bottom, var(--bg-panel) 0%, color-mix(in oklab, var(--bg-panel) 70%, transparent) 50%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 z-10 transition-opacity"
        style={{
          opacity: botFade,
          background:
            "linear-gradient(to top, var(--bg-panel) 0%, color-mix(in oklab, var(--bg-panel) 70%, transparent) 50%, transparent 100%)",
        }}
      />

      <div
        ref={scrollRef}
        className="scrollbar-hidden max-h-[200px] overflow-y-auto px-4 py-3 space-y-3"
      >
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
            B-Index
          </div>
          <div className="text-3xl font-semibold text-[var(--text-primary)] tabular-nums leading-none">
            {dash(vitals.bIndex)}
            <span className="text-base text-[var(--text-tertiary)] ml-0.5">
              %
            </span>
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <VitalRow label="Pulse" value={dash(vitals.pulse)} unit="bpm" />
          <VitalRow label="HRR" value={dash(vitals.hrr)} unit="bpm" />
          <VitalRow label="O₂" value={dash(vitals.oxygen)} unit="%" />
        </div>

        {hydrated && user && (
          <div className="pt-2 border-t border-[var(--glass-border)] space-y-1.5">
            <VitalRow label="ID" value={user.id} />
            <VitalRow label="Age" value={user.age} />
            <VitalRow
              label="Gender"
              value={user.gender === "male" ? "M" : "F"}
            />
          </div>
        )}
      </div>
    </div>
  );
}
