"use client";

import { motion } from "framer-motion";
import { useBlocksStore } from "@/stores/useBlocksStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMonitorStore } from "@/stores/useMonitorStore";
import { useHydrated } from "@/hooks/useHydrated";
import { MonitorVideo } from "./MonitorVideo";
import { ProfileBlock } from "./ProfileBlock";
import { SkinDots } from "./SkinDots";

export function Monitor() {
  const hydrated = useHydrated();
  const visible = useBlocksStore((s) => s.bothCollapsed());
  const userGender = useAuthStore((s) => s.user?.gender);
  const skin = useMonitorStore((s) => s.skin);
  const cycleSkin = useMonitorStore((s) => s.cycleSkin);

  // Default to 'male' on SSR / before hydration to keep server and
  // client trees identical; switch to user's gender after hydration.
  const gender = hydrated && userGender ? userGender : "male";

  return (
    <motion.section
      aria-label="Monitor"
      initial={false}
      animate={{
        flexGrow: visible ? 1 : 0,
        flexBasis: visible ? "auto" : 0,
        opacity: visible ? 1 : 0,
      }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col rounded-xl border border-[var(--glass-border)] bg-[var(--bg-panel)] overflow-hidden min-h-0 min-w-0"
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      <ProfileBlock />
      <MonitorVideo gender={gender} skin={skin} onClick={cycleSkin} />
      <div className="flex items-center justify-center py-3 border-t border-[var(--glass-border)]">
        <SkinDots />
      </div>
    </motion.section>
  );
}
