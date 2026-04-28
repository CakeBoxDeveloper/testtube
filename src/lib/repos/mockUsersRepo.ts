import "server-only";

import type { User } from "@/lib/types";
import type { UsersRepo } from "./types";

/**
 * In-memory storage that survives HMR reloads via globalThis but is lost
 * on full dev-server restart. Good for UI testing without Firebase creds.
 */
const g = globalThis as unknown as { __mockUsers?: Map<string, User> };
if (!g.__mockUsers) g.__mockUsers = new Map<string, User>();
const store = g.__mockUsers;

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

export const mockUsersRepo: UsersRepo = {
  async list() {
    return Array.from(store.values()).map(clone);
  },

  async get(id) {
    const u = store.get(id);
    return u ? clone(u) : null;
  },

  async create(user) {
    const now = Date.now();
    const payload: User = { ...(user as User), lastUpdated: now };
    store.set(String(user.id), clone(payload));
    return payload;
  },

  async update(id, patch) {
    const existing = store.get(id);
    if (!existing) {
      throw new Error(`mockUsersRepo.update: user "${id}" not found`);
    }
    const merged: User = { ...existing, ...patch, lastUpdated: Date.now() };
    store.set(id, clone(merged));
    return merged;
  },

  async remove(id) {
    store.delete(id);
  },
};
