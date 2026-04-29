interface TranscribeResult {
  text: string;
  provider: string;
  stub?: boolean;
}

export async function transcribe(
  blob: Blob,
  filename: string,
  language: string = "ru"
): Promise<TranscribeResult> {
  const form = new FormData();
  form.append("audio", blob, filename);
  form.append("language", language);

  const start = Date.now();
  console.log(
    `[api-client] → POST /api/ai/transcribe (${(blob.size / 1024).toFixed(1)}KB ${blob.type})`
  );

  const res = await fetch("/api/ai/transcribe", {
    method: "POST",
    body: form,
  });
  const ms = Date.now() - start;
  const ctype = res.headers.get("content-type") ?? "";
  const isJson = ctype.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    const msg =
      isJson && payload && typeof payload === "object" && "error" in payload
        ? String((payload as { error: unknown }).error)
        : res.statusText;
    console.error(
      `[api-client] ✖ POST /api/ai/transcribe ${res.status} (${ms}ms): ${msg}`
    );
    throw new Error(msg);
  }

  console.log(`[api-client] ← POST /api/ai/transcribe ${res.status} (${ms}ms)`);
  return payload as TranscribeResult;
}
