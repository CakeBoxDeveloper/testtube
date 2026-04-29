import type { TaskStep } from "./types";

interface RawStep {
  title: string;
  description: string;
  substeps: { title: string }[];
}

const NUMBERED_RE = /^\s*(\d+)[.)]\s+(.+)$/;
const SUBBULLET_RE = /^\s{1,}[-*•]\s+(.+)$/;
const HEADER_RE = /^#{1,4}\s+(.+)$/;
const TOPLEVEL_BULLET_RE = /^[-*•]\s+(.+)$/;

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

/**
 * Parse a markdown pipeline into a flat list of TaskSteps with parent/child links.
 *
 * Supported formats (best to fallback):
 *   1. "1. Title\n   description\n   - substep\n   - substep"
 *   2. "## Title\n   description"
 *   3. Plain text with "- " bullets at top level
 *   4. Falls back to a single step containing the whole text
 */
export function parsePipeline(markdown: string): RawStep[] {
  if (!markdown || !markdown.trim()) return [];

  const lines = markdown.split(/\r?\n/);
  const steps: RawStep[] = [];
  let current: RawStep | null = null;

  const pushDescriptionLine = (line: string) => {
    if (!current) return;
    const trimmed = line.trim();
    if (!trimmed) return;
    current.description = current.description
      ? `${current.description}\n${trimmed}`
      : trimmed;
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/g, "  ");
    if (!line.trim()) continue;

    const numbered = NUMBERED_RE.exec(line);
    if (numbered) {
      current = { title: numbered[2].trim(), description: "", substeps: [] };
      steps.push(current);
      continue;
    }

    const header = HEADER_RE.exec(line);
    if (header) {
      current = { title: header[1].trim(), description: "", substeps: [] };
      steps.push(current);
      continue;
    }

    const sub = SUBBULLET_RE.exec(line);
    if (sub) {
      if (current) {
        current.substeps.push({ title: sub[1].trim() });
        continue;
      }
      const top = TOPLEVEL_BULLET_RE.exec(line.trim());
      if (top) {
        current = { title: top[1].trim(), description: "", substeps: [] };
        steps.push(current);
        continue;
      }
    }

    if (!current && /^[-*•]\s+/.test(line.trim())) {
      const m = TOPLEVEL_BULLET_RE.exec(line.trim());
      if (m) {
        current = { title: m[1].trim(), description: "", substeps: [] };
        steps.push(current);
        continue;
      }
    }

    if (current) {
      pushDescriptionLine(line);
    } else {
      current = { title: line.trim(), description: "", substeps: [] };
      steps.push(current);
    }
  }

  return steps;
}

/**
 * Convert parsed pipeline into TaskStep[] with stable IDs and parent links.
 * Existing completion state is preserved by matching on title+parent path.
 */
export function pipelineToSteps(
  markdown: string,
  preserveFrom: TaskStep[] = []
): TaskStep[] {
  const raw = parsePipeline(markdown);
  const out: TaskStep[] = [];

  const findExisting = (
    title: string,
    level: 0 | 1,
    parentTitle?: string
  ): TaskStep | undefined => {
    return preserveFrom.find((s) => {
      if (s.level !== level) return false;
      if (s.title !== title) return false;
      if (level === 0) return true;
      const parent = preserveFrom.find((p) => p.id === s.parentId);
      return parent?.title === parentTitle;
    });
  };

  raw.forEach((step, i) => {
    const existing = findExisting(step.title, 0);
    const stepId = existing?.id ?? makeId("step");
    out.push({
      id: stepId,
      title: step.title,
      description: step.description || undefined,
      parentId: null,
      level: 0,
      completed: existing?.completed ?? false,
      order: i,
    });
    step.substeps.forEach((sub, j) => {
      const subExisting = findExisting(sub.title, 1, step.title);
      out.push({
        id: subExisting?.id ?? makeId("step"),
        title: sub.title,
        parentId: stepId,
        level: 1,
        completed: subExisting?.completed ?? false,
        order: j,
      });
    });
  });

  return out;
}

/** Recompute progress 0..100 from steps. Substeps weighted equally with main steps. */
export function computeStepsProgress(steps: TaskStep[]): number {
  if (!steps.length) return 0;
  const total = steps.length;
  const done = steps.filter((s) => s.completed).length;
  return Math.round((done / total) * 100);
}

/**
 * Toggle a step. If toggling a parent, all its substeps follow (mirror the new value).
 * If toggling a substep, the parent auto-completes when ALL its substeps are done.
 */
export function toggleStepCascade(steps: TaskStep[], stepId: string): TaskStep[] {
  const target = steps.find((s) => s.id === stepId);
  if (!target) return steps;
  const next = !target.completed;

  let result = steps.map((s) => {
    if (s.id === stepId) return { ...s, completed: next };
    if (target.level === 0 && s.parentId === stepId) {
      return { ...s, completed: next };
    }
    return s;
  });

  if (target.level === 1 && target.parentId) {
    const parentId = target.parentId;
    const siblings = result.filter((s) => s.parentId === parentId);
    const allDone = siblings.length > 0 && siblings.every((s) => s.completed);
    result = result.map((s) =>
      s.id === parentId ? { ...s, completed: allDone } : s
    );
  }

  return result;
}
