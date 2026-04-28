import "server-only";

import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400, details?: unknown) {
  if (status >= 500) {
    console.error(`[api] ${status} — ${message}`, details ?? "");
  } else {
    console.warn(`[api] ${status} — ${message}`);
  }
  return NextResponse.json(
    { error: message, ...(details !== undefined ? { details } : {}) },
    { status }
  );
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export async function readJson<T = unknown>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Wraps an API route handler with entry/exit/error logs.
 * Use as: export const POST = withLog("POST /api/foo", async (req) => { ... })
 */
export function withLog<TArgs extends unknown[], TRes>(
  label: string,
  handler: (...args: TArgs) => Promise<TRes>
): (...args: TArgs) => Promise<TRes> {
  return async (...args: TArgs) => {
    const start = Date.now();
    console.log(`[api] → ${label}`);
    try {
      const res = await handler(...args);
      console.log(`[api] ← ${label} (${Date.now() - start}ms)`);
      return res;
    } catch (e) {
      console.error(`[api] ✖ ${label} (${Date.now() - start}ms)`, e);
      throw e;
    }
  };
}
