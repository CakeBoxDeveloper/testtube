"use client";

import { ContentBlock } from "./ContentBlock";
import { ICONS } from "@/lib/assets";
import { Icon } from "@/components/ui/Icon";
import { useBlocksStore } from "@/stores/useBlocksStore";

export function BrowserBlock() {
  const collapsed = useBlocksStore((s) => s.collapsed.browser);
  const toggle = useBlocksStore((s) => s.toggle);

  return (
    <ContentBlock
      ariaLabel="Browser"
      collapsed={collapsed}
      onToggle={() => toggle("browser")}
    >
      <div className="flex items-center h-[40px] px-3 border-b border-[var(--glass-border)] gap-2">
        <Icon src={ICONS.dashboard} size={14} />
        <span className="text-xs text-[var(--text-secondary)]">Обзор</span>
      </div>
      <div className="flex-1 flex items-center justify-center text-xs text-[var(--text-tertiary)] p-6 text-center">
        <span>Browser block — сюда переедут задачи (слой 6).</span>
      </div>
    </ContentBlock>
  );
}
