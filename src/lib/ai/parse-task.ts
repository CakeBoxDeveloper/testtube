import type { Priority } from "@/lib/types";

export interface ParsedTask {
  title: string;
  description?: string;
  steps: string[];
  pipeline?: string;
  priority: Priority;
  deadlineHours?: number;
}

const PRIORITIES: Priority[] = ["low", "medium", "high", "critical"];

export function extractJsonObject(text: string): unknown | null {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = candidate.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}

export function parseTaskResponse(text: string): ParsedTask | null {
  const raw = extractJsonObject(text);
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const title = typeof obj.title === "string" ? obj.title.trim() : "";
  if (!title) return null;

  const description =
    typeof obj.description === "string" && obj.description.trim()
      ? obj.description.trim()
      : undefined;

  const stepsRaw = Array.isArray(obj.steps) ? obj.steps : [];
  const steps = stepsRaw
    .map((s) => {
      if (typeof s === "string") return s.trim();
      if (s && typeof s === "object" && "title" in s) {
        const t = (s as { title?: unknown }).title;
        return typeof t === "string" ? t.trim() : "";
      }
      return "";
    })
    .filter(Boolean);

  const priorityRaw =
    typeof obj.priority === "string" ? obj.priority.toLowerCase() : "medium";
  const priority: Priority = PRIORITIES.includes(priorityRaw as Priority)
    ? (priorityRaw as Priority)
    : "medium";

  const deadlineHoursRaw = obj.deadlineHours ?? obj.deadline_hours;
  const deadlineHours =
    typeof deadlineHoursRaw === "number" && deadlineHoursRaw > 0
      ? deadlineHoursRaw
      : undefined;

  const pipelineRaw =
    typeof obj.pipeline === "string" ? obj.pipeline.trim() : "";
  const pipeline = pipelineRaw || undefined;

  return { title, description, steps, pipeline, priority, deadlineHours };
}
