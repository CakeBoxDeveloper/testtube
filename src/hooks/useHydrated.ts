"use client";

import { useEffect, useState } from "react";

/**
 * Returns true after the client has hydrated. Use to gate any UI that
 * depends on values which differ between SSR and client (e.g. Zustand
 * `persist`-rehydrated state, browser APIs, locale-sensitive formatting)
 * to avoid React hydration mismatches.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
