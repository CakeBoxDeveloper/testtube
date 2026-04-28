import "server-only";

import { firestoreUsersRepo } from "./firestoreUsersRepo";
import { mockUsersRepo } from "./mockUsersRepo";
import type { UsersRepo } from "./types";

export type { UsersRepo } from "./types";

let logged = false;

function shouldMock(): boolean {
  return process.env.MOCK_FIREBASE === "1";
}

export function usersRepo(): UsersRepo {
  const mock = shouldMock();
  if (!logged) {
    console.log(
      `[repos] mode=${mock ? "MOCK (in-memory)" : "FIRESTORE"}` +
        (mock ? " — set MOCK_FIREBASE=0 to use real Firebase" : "")
    );
    logged = true;
  }
  return mock ? mockUsersRepo : firestoreUsersRepo;
}
