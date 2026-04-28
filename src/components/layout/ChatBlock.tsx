"use client";

import { ContentBlock } from "./ContentBlock";
import { useBlocksStore } from "@/stores/useBlocksStore";

export function ChatBlock() {
  const collapsed = useBlocksStore((s) => s.collapsed.chat);
  const toggle = useBlocksStore((s) => s.toggle);

  return (
    <ContentBlock
      ariaLabel="Chat"
      collapsed={collapsed}
      onToggle={() => toggle("chat")}
    >
      <div className="flex items-center h-[40px] px-3 border-b border-[var(--glass-border)]">
        <span className="text-xs font-medium text-[var(--text-primary)]">
          Proxima
        </span>
      </div>
      <div className="flex-1 flex items-center justify-center text-xs text-[var(--text-tertiary)] p-6 text-center">
        <span>Chat block — Proxima переедет на слое 5.</span>
      </div>
    </ContentBlock>
  );
}
