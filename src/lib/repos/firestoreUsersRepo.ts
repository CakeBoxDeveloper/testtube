import "server-only";

import { adminDb } from "@/lib/firebase-admin";
import type { User } from "@/lib/types";
import type { UsersRepo } from "./types";

const COLLECTION = "users";

export const firestoreUsersRepo: UsersRepo = {
  async list() {
    const snap = await adminDb().collection(COLLECTION).get();
    return snap.docs.map((d) => ({ ...(d.data() as User), id: Number(d.id) }));
  },

  async get(id) {
    const snap = await adminDb().collection(COLLECTION).doc(id).get();
    if (!snap.exists) return null;
    return { ...(snap.data() as User), id: Number(id) };
  },

  async create(user) {
    const ref = adminDb().collection(COLLECTION).doc(String(user.id));
    const now = Date.now();
    const payload = { ...user, lastUpdated: now };
    await ref.set(payload);
    return payload as User;
  },

  async update(id, patch) {
    const ref = adminDb().collection(COLLECTION).doc(id);
    await ref.set({ ...patch, lastUpdated: Date.now() }, { merge: true });
    const fresh = await ref.get();
    return { ...(fresh.data() as User), id: Number(id) };
  },

  async remove(id) {
    await adminDb().collection(COLLECTION).doc(id).delete();
  },
};
