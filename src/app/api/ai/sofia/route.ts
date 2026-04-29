import { jsonError, jsonOk, readJson, withLog } from "@/lib/api-utils";
import { callGroq, type AiTurn } from "@/lib/ai/providers";

export const runtime = "nodejs";

interface Body {
  message: string;
  history?: AiTurn[];
  user?: { age?: number; gender?: "male" | "female" };
}

const SYSTEM_PROMPT = `Ты София — AI-ассистент по здоровью, спорту, питанию, восстановлению и обучению.
Отвечай на русском, кратко и по делу. Используй markdown для списков и акцентов.
Учитывай возраст и пол пользователя, если они указаны. Если совет требует медицинской квалификации — мягко напомни обратиться к специалисту.`;

export const POST = withLog("POST /api/ai/sofia", async (req: Request) => {
  try {
    const body = await readJson<Body>(req);
    const message = (body.message || "").toString().trim();
    if (!message) return jsonError("message is required");
    const history = Array.isArray(body.history) ? body.history.slice(-20) : [];

    const profile = body.user
      ? `\nПрофиль пользователя: возраст=${body.user.age ?? "?"}, пол=${body.user.gender ?? "?"}.`
      : "";

    const result = await callGroq({
      systemPrompt: SYSTEM_PROMPT + profile,
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
