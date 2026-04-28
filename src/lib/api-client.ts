type FetchOpts = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
};

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public payload?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function buildUrl(path: string, query?: FetchOpts["query"]): string {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined) params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export async function api<T = unknown>(
  path: string,
  opts: FetchOpts = {}
): Promise<T> {
  const { body, query, headers, ...rest } = opts;
  const init: RequestInit = {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
  };
  if (body !== undefined) {
    init.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  const url = buildUrl(path, query);
  const method = (rest.method ?? "GET").toUpperCase();
  const start = Date.now();
  console.log(`[api-client] → ${method} ${url}`);

  const res = await fetch(url, init);
  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : await res.text();
  const ms = Date.now() - start;

  if (!res.ok) {
    const msg =
      isJson && payload && typeof payload === "object" && "error" in payload
        ? String((payload as { error: unknown }).error)
        : res.statusText;
    console.error(`[api-client] ✖ ${method} ${url} ${res.status} (${ms}ms): ${msg}`, payload);
    throw new ApiError(res.status, msg, payload);
  }
  console.log(`[api-client] ← ${method} ${url} ${res.status} (${ms}ms)`);
  return payload as T;
}

api.get = <T = unknown>(path: string, opts?: FetchOpts) =>
  api<T>(path, { ...opts, method: "GET" });

api.post = <T = unknown>(path: string, body?: unknown, opts?: FetchOpts) =>
  api<T>(path, { ...opts, method: "POST", body });

api.patch = <T = unknown>(path: string, body?: unknown, opts?: FetchOpts) =>
  api<T>(path, { ...opts, method: "PATCH", body });

api.del = <T = unknown>(path: string, opts?: FetchOpts) =>
  api<T>(path, { ...opts, method: "DELETE" });

export { ApiError };
