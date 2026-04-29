import { jsonError, jsonOk, readJson, withLog } from "@/lib/api-utils";
import { callGemini } from "@/lib/ai/providers";
import type { Priority } from "@/lib/types";

export const runtime = "nodejs";

interface Body {
  title: string;
  description?: string;
  priority?: Priority;
  deadlineHours?: number;
}

const SYSTEM_PROMPT = `Ты — Проксима, AI-планировщик задач. По заголовку и описанию задачи сгенерируй детальный пошаговый план.

Формат — нумерованный markdown БЕЗ кодблоков, БЕЗ пояснений вокруг:

1. Краткое название первого шага
   Развёрнутое описание шага: что именно сделать, какие инструменты, на что обратить внимание (1-3 предложения).
   - Подшаг 1
   - Подшаг 2
2. Краткое название второго шага
   Описание второго шага.

Правила:
- 3-7 главных шагов
- 0-4 подшага у шага (необязательно у каждого)
- описание шага — на отдельной строке после заголовка
- подшаги — с двумя пробелами и дефисом
- учитывай приоритет (critical/high → больше срочных шагов, low → расслабленнее)
- русский язык
- ТОЛЬКО pipeline, никакого JSON, никаких пояснений вокруг`;

const STUB_PIPELINE = `1. Уточнить детали
   Сформулировать задачу полнее: что нужно сделать, в каком объёме, к какому сроку.
2. Подобрать инструменты
   Определить, какие материалы, ПО или ресурсы понадобятся.
   - Составить список
   - Проверить доступность
3. Выполнить и проверить
   Сделать основной объём работы и убедиться, что результат соответствует требованиям.`;

export const POST = withLog(
  "POST /api/ai/proxima/pipeline",
  async (req: Request) => {
    try {
      const body = await readJson<Body>(req);
      const title = (body.title || "").toString().trim();
      if (!title) return jsonError("title is required");

      const description = (body.description || "").toString().trim();
      const priority = body.priority || "medium";
      const deadlineHours = body.deadlineHours;

      const userMessage = [
        `Название: ${title}`,
        description ? `Описание: ${description}` : "",
        `Приоритет: ${priority}`,
        deadlineHours ? `Дедлайн через ~${deadlineHours} часов` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const result = await callGemini({
        systemPrompt: SYSTEM_PROMPT,
        history: [],
        userMessage,
      });

      if (result.stub) {
        return jsonOk({
          pipeline: STUB_PIPELINE,
          provider: result.provider,
          stub: true,
        });
      }

      const pipeline = result.reply
        .replace(/```(?:markdown)?\s*([\s\S]*?)```/i, "$1")
        .trim();

      if (!pipeline) {
        return jsonError("Empty pipeline from model", 502, {
          provider: result.provider,
        });
      }

      return jsonOk({ pipeline, provider: result.provider });
    } catch (e) {
      if (e instanceof Response) return e;
      const msg = e instanceof Error ? e.message : "Unknown error";
      return jsonError(msg, 500);
    }
  }
);
