import { jsonError, jsonOk, readJson, withLog } from "@/lib/api-utils";
import { callGemini } from "@/lib/ai/providers";
import { parseTaskResponse } from "@/lib/ai/parse-task";

export const runtime = "nodejs";

interface Body {
  text: string;
}

const SYSTEM_PROMPT = `Ты — Проксима, AI-планировщик задач. Преобразуй описание задачи пользователя в строгий JSON-объект ТОЛЬКО без какого-либо текста вокруг и без markdown-кодблоков.

Схема:
{
  "title": "краткое название (до 80 символов, без точки в конце)",
  "description": "1-2 предложения сути задачи",
  "priority": "low" | "medium" | "high" | "critical",
  "deadlineHours": <число часов от сейчас до дедлайна, опционально>,
  "pipeline": "<markdown>"
}

Формат поля pipeline (СТРОГО так, без markdown-фенсинга):
1. Краткое название первого шага
   Развёрнутое описание шага: что именно сделать, какие инструменты, на что обратить внимание (1-3 предложения).
   - Подшаг 1
   - Подшаг 2
2. Краткое название второго шага
   Описание второго шага.
   - Подшаг

Правила:
- 3-7 главных шагов
- 0-4 подшага у шага (необязательно у каждого)
- описание шага — на отдельной строке после заголовка, с двумя пробелами в начале
- подшаги — с двумя пробелами и дефисом
- priority выбирается по срочности: critical = срочно/блокирует другое, high = сегодня-завтра, medium = эта неделя, low = когда-нибудь
- deadlineHours указывай только если пользователь упомянул срок
- description краткое, не дублирует title
- Отвечай на русском
- Возвращай ТОЛЬКО JSON. Никакого markdown, никаких объяснений.`;

const STUB_PIPELINE = `1. Уточнить детали
   Сформулировать задачу полнее: что нужно сделать, в каком объёме, к какому сроку.
2. Подобрать инструменты
   Определить, какие материалы, ПО или ресурсы понадобятся.
   - Составить список
   - Проверить доступность
3. Выполнить и проверить
   Сделать основной объём работы и убедиться, что результат соответствует требованиям.`;

export const POST = withLog(
  "POST /api/ai/proxima/enhance",
  async (req: Request) => {
    try {
      const body = await readJson<Body>(req);
      const text = (body.text || "").toString().trim();
      if (!text) return jsonError("text is required");
      if (text.length > 4000) return jsonError("text too long", 413);

      const result = await callGemini({
        systemPrompt: SYSTEM_PROMPT,
        history: [],
        userMessage: text,
      });

      if (result.stub) {
        const title = text.split(/[.\n]/)[0].slice(0, 80) || "Новая задача";
        return jsonOk({
          task: {
            title,
            description: text.length > 80 ? text.slice(0, 200) : undefined,
            steps: [
              "Уточнить детали",
              "Подобрать инструменты",
              "Выполнить и проверить",
            ],
            pipeline: STUB_PIPELINE,
            priority: "medium" as const,
          },
          provider: result.provider,
          stub: true,
        });
      }

      const parsed = parseTaskResponse(result.reply);
      if (!parsed) {
        return jsonError(
          "Не удалось распознать ответ модели как структурированную задачу. Попробуй сформулировать иначе.",
          422,
          { provider: result.provider, raw: result.reply.slice(0, 600) }
        );
      }
      return jsonOk({ task: parsed, provider: result.provider, stub: result.stub });
    } catch (e) {
      if (e instanceof Response) return e;
      const msg = e instanceof Error ? e.message : "Unknown error";
      return jsonError(msg, 500);
    }
  }
);
