import { jsonError, jsonOk, readJson, withLog } from "@/lib/api-utils";
import { usersRepo } from "@/lib/repos";

export const runtime = "nodejs";

interface LoginBody {
  id?: number | string;
  pin?: string;
}

export const POST = withLog("POST /api/auth/login", async (req: Request) => {
  try {
    const body = await readJson<LoginBody>(req);
    const id = typeof body.id === "string" ? Number(body.id) : body.id;
    const pin = body.pin;

    console.log(`[auth] login attempt id=${id}`);

    if (typeof id !== "number" || Number.isNaN(id) || !pin) {
      return jsonError("id (number) and pin are required");
    }

    const user = await usersRepo().get(String(id));
    if (!user) {
      console.warn(`[auth] user not found id=${id}`);
      return jsonError("Неверный ID или PIN", 401);
    }
    if (user.pin !== pin) {
      console.warn(`[auth] bad pin for id=${id}`);
      return jsonError("Неверный ID или PIN", 401);
    }

    console.log(`[auth] login OK id=${id}`);
    return jsonOk({ user });
  } catch (e) {
    if (e instanceof Response) return e;
    const msg = e instanceof Error ? e.message : "Unknown error";
    return jsonError(msg, 500);
  }
});
