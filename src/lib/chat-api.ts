import { api } from "./api-client";
import type { ChatMessage, ModuleId } from "./types";

export interface AiResponse {
  reply: string;
  provider: string;
  stub?: boolean;
}

interface SendInput {
  message: string;
  history: ChatMessage[];
  user?: { age?: number; gender?: "male" | "female" };
  tasksContext?: string;
}

function toTurns(history: ChatMessage[]) {
  return history.map((m) => ({ role: m.role, text: m.text }));
}

export const chatApi = {
  send: (module: ModuleId, input: SendInput) =>
    api.post<AiResponse>(`/api/ai/${module}`, {
      message: input.message,
      history: toTurns(input.history),
      user: input.user,
      tasksContext: input.tasksContext,
    }),
};
