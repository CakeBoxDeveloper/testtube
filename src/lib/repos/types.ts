import "server-only";
import type { User } from "@/lib/types";

export interface UsersRepo {
  list(): Promise<User[]>;
  get(id: string): Promise<User | null>;
  create(user: Partial<User> & { id: number; pin: string }): Promise<User>;
  update(id: string, patch: Partial<User>): Promise<User>;
  remove(id: string): Promise<void>;
}
