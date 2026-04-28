import { api } from "./api-client";
import type { User } from "./types";

export const usersApi = {
  list: () => api.get<{ users: User[] }>("/api/users"),
  get: (id: number | string) => api.get<{ user: User }>(`/api/users/${id}`),
  create: (user: Partial<User>) => api.post<{ user: User }>("/api/users", user),
  patch: (id: number | string, patch: Partial<User>) =>
    api.patch<{ user: User }>(`/api/users/${id}`, patch),
  remove: (id: number | string) => api.del<{ ok: true }>(`/api/users/${id}`),
};

export const authApi = {
  login: (id: number, pin: string) =>
    api.post<{ user: User }>("/api/auth/login", { id, pin }),
  register: (payload: { id: number; pin: string; age: number; gender: "male" | "female" }) =>
    usersApi.create(payload),
};
