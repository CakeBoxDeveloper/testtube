"use client";

import { Header } from "./Header";
import { BrowserBlock } from "./BrowserBlock";
import { ChatBlock } from "./ChatBlock";
import { Monitor } from "@/components/monitor/Monitor";
import { AuthOverlay } from "@/features/auth/AuthOverlay";

export function AppShell() {
  return (
    <div className="flex flex-col h-[100dvh] w-full">
      <Header />
      <main className="flex-1 flex flex-col lg:flex-row gap-2 p-2 min-h-0 min-w-0">
        <BrowserBlock />
        <Monitor />
        <ChatBlock />
      </main>
      <AuthOverlay />
    </div>
  );
}
