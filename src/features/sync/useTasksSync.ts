"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useTasksStore } from "@/stores/useTasksStore";
import { useHydrated } from "@/hooks/useHydrated";
import { usersApi } from "@/lib/users-api";

const DEBOUNCE_MS = 1500;

export function useTasksSync() {
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const tasks = useTasksStore((s) => s.tasks);
  const order = useTasksStore((s) => s.order);
  const hydrate = useTasksStore((s) => s.hydrate);

  const lastUserIdRef = useRef<number | null>(null);
  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextRef = useRef(false);

  // 1) On user login — pull from server, but only if local is empty.
  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      lastUserIdRef.current = null;
      return;
    }
    if (lastUserIdRef.current === user.id) return;
    lastUserIdRef.current = user.id;

    let cancelled = false;
    (async () => {
      try {
        const { user: fresh } = await usersApi.get(user.id);
        if (cancelled) return;
        const remote = (fresh.tasks_helix ?? {}) as Record<string, unknown>;
        const localEmpty =
          Object.keys(useTasksStore.getState().tasks).length === 0;
        const remoteHas = Object.keys(remote).length > 0;
        if (localEmpty && remoteHas) {
          skipNextRef.current = true;
          hydrate(remote as Parameters<typeof hydrate>[0]);
        }
      } catch (e) {
        console.warn("[tasks-sync] hydrate failed", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, user, hydrate]);

  // 2) Push local changes to server (debounced).
  useEffect(() => {
    if (!hydrated || !user) return;
    if (skipNextRef.current) {
      skipNextRef.current = false;
      return;
    }
    if (pendingRef.current) clearTimeout(pendingRef.current);
    const userId = user.id;
    pendingRef.current = setTimeout(async () => {
      try {
        await usersApi.patch(userId, {
          tasks_helix: tasks,
        });
      } catch (e) {
        console.warn("[tasks-sync] patch failed", e);
      }
    }, DEBOUNCE_MS);
    return () => {
      if (pendingRef.current) clearTimeout(pendingRef.current);
    };
  }, [hydrated, user, tasks, order]);
}
