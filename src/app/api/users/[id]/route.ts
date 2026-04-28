import { jsonError, jsonOk, readJson, withLog } from "@/lib/api-utils";
import { usersRepo } from "@/lib/repos";
import type { User } from "@/lib/types";

export const runtime = "nodejs";

interface Ctx {
  params: Promise<{ id: string }>;
}

export const GET = withLog("GET /api/users/[id]", async (_req: Request, ctx: Ctx) => {
  try {
    const { id } = await ctx.params;
    const user = await usersRepo().get(id);
    if (!user) return jsonError("User not found", 404);
    return jsonOk({ user });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return jsonError(msg, 500);
  }
});

export const PATCH = withLog("PATCH /api/users/[id]", async (req: Request, ctx: Ctx) => {
  try {
    const { id } = await ctx.params;
    const body = await readJson<Partial<User>>(req);
    const repo = usersRepo();
    const existing = await repo.get(id);
    if (!existing) return jsonError("User not found", 404);
    const user = await repo.update(id, body);
    return jsonOk({ user });
  } catch (e) {
    if (e instanceof Response) return e;
    const msg = e instanceof Error ? e.message : "Unknown error";
    return jsonError(msg, 500);
  }
});

export const DELETE = withLog("DELETE /api/users/[id]", async (_req: Request, ctx: Ctx) => {
  try {
    const { id } = await ctx.params;
    await usersRepo().remove(id);
    return jsonOk({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return jsonError(msg, 500);
  }
});
