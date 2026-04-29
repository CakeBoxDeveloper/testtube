import { api } from "./api-client";
import type { ParsedTask } from "./ai/parse-task";
import type { Priority } from "./types";

export const proximaApi = {
  enhance: (text: string) =>
    api.post<{ task: ParsedTask; provider: string; stub?: boolean }>(
      "/api/ai/proxima/enhance",
      { text }
    ),

  generatePipeline: (input: {
    title: string;
    description?: string;
    priority?: Priority;
    deadlineHours?: number;
  }) =>
    api.post<{ pipeline: string; provider: string; stub?: boolean }>(
      "/api/ai/proxima/pipeline",
      input
    ),
};
