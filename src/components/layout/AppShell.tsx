"use client";

import { Header } from "./Header";
import { BrowserBlock } from "./BrowserBlock";
import { ChatBlock } from "./ChatBlock";
import { BottomNav } from "./BottomNav";
import { Monitor } from "@/components/monitor/Monitor";
import { AuthOverlay } from "@/features/auth/AuthOverlay";
import { useBlocksStore } from "@/stores/useBlocksStore";
import { useTasksSync } from "@/features/sync/useTasksSync";
import { useStatsSync } from "@/features/sync/useStatsSync";

export function AppShell() {
  useTasksSync();
  useStatsSync();
  const setCollapsed = useBlocksStore((s) => s.setCollapsed);
  const bothCollapsed = useBlocksStore((s) => s.bothCollapsed());

  const onLogoClick = () => {
    if (bothCollapsed) {
      setCollapsed("browser", false);
      setCollapsed("chat", false);
    } else {
      setCollapsed("browser", true);
      setCollapsed("chat", true);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full">
      <Header onLogoClick={onLogoClick} />
      <main className="flex-1 flex flex-col lg:flex-row gap-2 p-2 min-h-0 min-w-0">
        <BrowserBlock />
        <Monitor />
        <ChatBlock />
      </main>
      <BottomNav />
      <AuthOverlay />
    </div>
  );
}
