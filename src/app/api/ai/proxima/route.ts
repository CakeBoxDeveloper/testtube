import { jsonError, jsonOk, readJson, withLog } from "@/lib/api-utils";
import { callGemini, type AiTurn } from "@/lib/ai/providers";

export const runtime = "nodejs";

interface Body {
  message: string;
  history?: AiTurn[];
  tasksContext?: string;
}

const SYSTEM_PROMPT = `Ты Проксима — AI-планировщик задач. Помогаешь пользователю формулировать конкретные краткосрочные задачи и разбивать их на шаги.
Отвечай на русском. Если уместно — предложи список шагов в виде нумерованного markdown-списка, оцени приоритет и срочность.
Если пользователь просит создать задачу — верни структурированный план: название, описание (1-2 предложения), список из 3–7 шагов, приоритет (низкий/средний/высокий/критический), оценку срока в часах/днях.`;

export const POST = withLog("POST /api/ai/proxima", async (req: Request) => {
  try {
    const body = await readJson<Body>(req);
    const message = (body.message || "").toString().trim();
    if (!message) return jsonError("message is required");
    const history = Array.isArray(body.history) ? body.history.slice(-20) : [];

    const ctx = body.tasksContext
      ? `\n\nКонтекст задач пользователя:\n${body.tasksContext}`
      : "";

    const result = await callGemini({
      systemPrompt: SYSTEM_PROMPT + ctx,
      history,
      userMessage: message,
    });
    return jsonOk(result);
  } catch (e) {
    if (e instanceof Response) return e;
    const msg = e instanceof Error ? e.message : "Unknown error";
    return jsonError(msg, 500);
  }
});
