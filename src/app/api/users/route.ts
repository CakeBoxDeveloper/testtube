import { jsonError, jsonOk, readJson, withLog } from "@/lib/api-utils";
import { usersRepo } from "@/lib/repos";
import type { User } from "@/lib/types";

export const runtime = "nodejs";

export const GET = withLog("GET /api/users", async () => {
  try {
    const users = await usersRepo().list();
    console.log(`[users] list count=${users.length}`);
    return jsonOk({ users });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return jsonError(msg, 500);
  }
});

export const POST = withLog("POST /api/users", async (req: Request) => {
  try {
    const body = await readJson<Partial<User>>(req);
    if (typeof body.id !== "number" || !body.pin) {
      return jsonError("id (number) and pin are required");
    }
    console.log(`[users] register attempt id=${body.id}`);

    const repo = usersRepo();
    const existing = await repo.get(String(body.id));
    if (existing) {
      console.warn(`[users] register conflict id=${body.id}`);
      return jsonError("User already exists", 409);
    }

    const user = await repo.create({ ...body, id: body.id, pin: body.pin });
    console.log(`[users] register OK id=${body.id}`);
    return jsonOk({ user }, 201);
  } catch (e) {
    if (e instanceof Response) return e;
    const msg = e instanceof Error ? e.message : "Unknown error";
    return jsonError(msg, 500);
  }
});
