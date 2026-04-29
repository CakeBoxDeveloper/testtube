"use client";

import clsx from "clsx";
import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/types";
import { Markdown } from "./Markdown";

interface MessageListProps {
  messages: ChatMessage[];
  sending: boolean;
  emptyHint?: string;
}

export function MessageList({ messages, sending, emptyHint }: MessageListProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, sending]);

  if (messages.length === 0 && !sending) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-[11px] text-[var(--text-tertiary)] text-center">
        {emptyHint ?? "Напиши первое сообщение."}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2 min-h-0"
    >
      {messages.map((msg, i) => (
        <div
          key={msg.id ?? i}
          className={clsx(
            "max-w-[88%] px-3 py-2 rounded-2xl break-words",
            msg.role === "user"
              ? "self-end bg-white/10 rounded-br-md"
              : "self-start bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-bl-md"
          )}
        >
          <Markdown>{msg.text}</Markdown>
        </div>
      ))}
      {sending && (
        <div className="self-start px-3 py-2 rounded-2xl rounded-bl-md bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <span className="inline-flex gap-1 text-[var(--text-tertiary)]">
            <Dot delay={0} />
            <Dot delay={0.15} />
            <Dot delay={0.3} />
          </span>
        </div>
      )}
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full bg-current"
      style={{
        animation: "msePulse 1.2s ease-in-out infinite",
        animationDelay: `${delay}s`,
      }}
    />
  );
}
