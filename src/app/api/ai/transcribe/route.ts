import { jsonError, jsonOk, withLog } from "@/lib/api-utils";

export const runtime = "nodejs";

const GROQ_TRANSCRIBE_URL =
  "https://api.groq.com/openai/v1/audio/transcriptions";

const MAX_BYTES = 25 * 1024 * 1024; // 25MB — Whisper API limit

export const POST = withLog(
  "POST /api/ai/transcribe",
  async (req: Request) => {
    try {
      const apiKey = process.env.GROQ_API_KEY;
      const model = process.env.GROQ_WHISPER_MODEL || "whisper-large-v3";

      const form = await req.formData();
      const audioRaw = form.get("audio");
      if (!audioRaw || typeof audioRaw === "string") {
        return jsonError("audio file is required", 400);
      }
      const audio = audioRaw as Blob;
      const size = audio.size;
      if (size === 0) return jsonError("audio is empty", 400);
      if (size > MAX_BYTES) return jsonError("audio too large", 413);

      const language =
        typeof form.get("language") === "string"
          ? (form.get("language") as string)
          : "ru";

      if (!apiKey) {
        return jsonOk({
          text: "(stub: GROQ_API_KEY не задан в .env.local — голосовой ввод отключён)",
          provider: "groq-whisper-stub",
          stub: true,
        });
      }

      const upstream = new FormData();
      const incomingName =
        audioRaw instanceof File && audioRaw.name ? audioRaw.name : "audio.webm";
      const file = new File([audio], incomingName, {
        type: audio.type || "audio/webm",
      });
      upstream.append("file", file);
      upstream.append("model", model);
      upstream.append("language", language);
      upstream.append("response_format", "json");
      upstream.append("temperature", "0");

      const res = await fetch(GROQ_TRANSCRIBE_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: upstream,
      });
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
        return jsonError(`Groq Whisper: ${msg}`, 502);
      }

      const transcribed =
        typeof data === "object" && data && "text" in data
          ? String((data as { text: unknown }).text || "").trim()
          : "";
      return jsonOk({
        text: transcribed,
        provider: `groq/${model}`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      return jsonError(msg, 500);
    }
  }
);
