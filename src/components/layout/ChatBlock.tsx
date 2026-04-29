"use client";

import { useEffect } from "react";
import { ContentBlock } from "./ContentBlock";
import { ChatTabs } from "@/features/chat/ChatTabs";
import { MessageList } from "@/features/chat/MessageList";
import { MessageInput } from "@/features/chat/MessageInput";
import { useBlocksStore } from "@/stores/useBlocksStore";
import { useChatStore } from "@/stores/useChatStore";
import { useModuleStore } from "@/stores/useModuleStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useTasksStore } from "@/stores/useTasksStore";
import { useHydrated } from "@/hooks/useHydrated";
import { chatApi } from "@/lib/chat-api";
import type { ModuleId } from "@/lib/types";

export function ChatBlock() {
  const hydrated = useHydrated();
  const collapsed = useBlocksStore((s) => s.collapsed.chat);
  const toggle = useBlocksStore((s) => s.toggle);

  const moduleId = useModuleStore((s) => s.module);
  const activeModule: ModuleId = hydrated ? moduleId : "sofia";

  const ensureBaseTabs = useChatStore((s) => s.ensureBaseTabs);
  const tabs = useChatStore((s) => s.tabs);
  const activeTabId = useChatStore((s) => s.activeTabId[activeModule]);
  const sending = useChatStore((s) => s.sending);
  const appendMessage = useChatStore((s) => s.appendMessage);
  const setSending = useChatStore((s) => s.setSending);

  const user = useAuthStore((s) => s.user);
  const tasks = useTasksStore((s) => s.tasks);

  useEffect(() => {
    ensureBaseTabs();
  }, [ensureBaseTabs]);

  const tab = activeTabId ? tabs[activeTabId] : null;
  const tabSending = activeTabId ? !!sending[activeTabId] : false;

  const placeholder =
    activeModule === "sofia"
      ? "Спроси Софию о здоровье…"
      : "Опиши задачу для Проксимы…";

  const emptyHint =
    activeModule === "sofia"
      ? "Задай первый вопрос Софии."
      : "Опиши задачу — Проксима разобьёт её на шаги.";

  const send = async (text: string) => {
    if (!tab) return;
    const tabId = tab.id;
    const userMsg = { role: "user" as const, text };
    appendMessage(tabId, userMsg);
    setSending(tabId, true);
    try {
      const tasksContext =
        activeModule === "proxima"
          ? Object.values(tasks)
              .slice(0, 10)
              .map(
                (t) =>
                  `- ${t.title} (${t.priority}, ${t.progress}%${t.deadline ? `, до ${new Date(t.deadline).toLocaleDateString()}` : ""})`
              )
              .join("\n") || "(задач пока нет)"
          : undefined;

      const res = await chatApi.send(activeModule, {
        message: text,
        history: tab.messages,
        user: hydrated && user ? { age: user.age, gender: user.gender } : undefined,
        tasksContext,
      });
      appendMessage(tabId, { role: "ai", text: res.reply });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка сети";
      appendMessage(tabId, {
        role: "ai",
        text: `_(ошибка: ${msg})_`,
      });
    } finally {
      setSending(tabId, false);
    }
  };

  return (
    <ContentBlock
      ariaLabel="Chat"
      collapsed={collapsed}
      onToggle={() => toggle("chat")}
    >
      <div className="flex flex-col h-full min-h-0">
        <ChatTabs module={activeModule} />
        {tab ? (
          <>
            <MessageList
              messages={tab.messages}
              sending={tabSending}
              emptyHint={emptyHint}
            />
            <MessageInput
              disabled={tabSending}
              onSend={send}
              placeholder={placeholder}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[11px] text-[var(--text-tertiary)] p-6">
            Чат загружается…
          </div>
        )}
      </div>
    </ContentBlock>
  );
}
