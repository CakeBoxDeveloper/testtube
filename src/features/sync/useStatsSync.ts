"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  useStatsStore,
  type StatsSnapshot,
} from "@/stores/useStatsStore";
import { useHydrated } from "@/hooks/useHydrated";
import { usersApi } from "@/lib/users-api";

const DEBOUNCE_MS = 1500;

function isStatsSnapshot(v: unknown): v is Partial<StatsSnapshot> {
  return !!v && typeof v === "object";
}

export function useStatsSync() {
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const weights = useStatsStore((s) => s.weights);
  const achievements = useStatsStore((s) => s.achievements);
  const examScores = useStatsStore((s) => s.examScores);
  const hydrateStats = useStatsStore((s) => s.hydrate);

  const lastUserIdRef = useRef<number | null>(null);
  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextRef = useRef(false);

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
        const remote = fresh.statsData;
        if (!isStatsSnapshot(remote)) return;
        const local = useStatsStore.getState();
        const localEmpty =
          local.weights.length === 0 &&
          local.achievements.length === 0 &&
          Object.keys(local.examScores).length === 0;
        const remoteHas =
          (Array.isArray(remote.weights) && remote.weights.length > 0) ||
          (Array.isArray(remote.achievements) &&
            remote.achievements.length > 0) ||
          (remote.examScores &&
            typeof remote.examScores === "object" &&
            Object.keys(remote.examScores as object).length > 0);
        if (localEmpty && remoteHas) {
          skipNextRef.current = true;
          hydrateStats(remote);
        }
      } catch (e) {
        console.warn("[stats-sync] hydrate failed", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, user, hydrateStats]);

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
          statsData: { weights, achievements, examScores },
          weightData: weights,
          achievements,
        });
      } catch (e) {
        console.warn("[stats-sync] patch failed", e);
      }
    }, DEBOUNCE_MS);
    return () => {
      if (pendingRef.current) clearTimeout(pendingRef.current);
    };
  }, [hydrated, user, weights, achievements, examScores]);
}
