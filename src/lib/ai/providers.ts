import "server-only";

export interface AiTurn {
  role: "user" | "ai";
  text: string;
}

export interface AiCallInput {
  history: AiTurn[];
  userMessage: string;
  systemPrompt: string;
}

export interface AiCallResult {
  reply: string;
  provider: string;
  stub?: boolean;
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

async function fetchJson(url: string, init: RequestInit) {
  const res = await fetch(url, init);
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg =
      typeof data === "object" && data && "error" in data
        ? JSON.stringify((data as { error: unknown }).error)
        : String(data || res.statusText);
    throw new Error(`${res.status} ${msg}`);
  }
  return data;
}

export async function callGroq(input: AiCallInput): Promise<AiCallResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return stubReply("groq", input.userMessage);
  }
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const messages = [
    { role: "system", content: input.systemPrompt },
    ...input.history.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text,
    })),
    { role: "user", content: input.userMessage },
  ];

  const data = (await fetchJson(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.5 }),
  })) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const reply =
    data?.choices?.[0]?.message?.content?.trim() ||
    "(София молчит — пустой ответ от модели)";
  return { reply, provider: `groq/${model}` };
}

export async function callGemini(input: AiCallInput): Promise<AiCallResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return stubReply("gemini", input.userMessage);
  }
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `${GEMINI_URL}/${model}:generateContent?key=${apiKey}`;

  const contents = [
    ...input.history.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    })),
    { role: "user", parts: [{ text: input.userMessage }] },
  ];

  const data = (await fetchJson(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { role: "system", parts: [{ text: input.systemPrompt }] },
      contents,
      generationConfig: { temperature: 0.6 },
    }),
  })) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const reply =
    parts
      .map((p) => p.text || "")
      .join("\n")
      .trim() || "(Проксима молчит — пустой ответ от модели)";
  return { reply, provider: `gemini/${model}` };
}

function stubReply(provider: string, msg: string): AiCallResult {
  return {
    reply:
      `_(stub: ${provider} API key не задан в .env.local)_\n\n` +
      `Ты сказал: **${msg.slice(0, 200)}**\n\n` +
      `Чтобы получить настоящий ответ, добавь \`${
        provider === "groq" ? "GROQ_API_KEY" : "GEMINI_API_KEY"
      }=...\` в \`.env.local\` и перезапусти dev-сервер.`,
    provider: `${provider}-stub`,
    stub: true,
  };
}
