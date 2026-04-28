"use client";

import { useEffect } from "react";
import { resolveTheme, useThemeStore } from "@/stores/useThemeStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const apply = () => {
      const resolved = resolveTheme(theme);
      document.documentElement.dataset.theme = resolved;
    };
    apply();

    if (theme !== "auto") return;
    const mql = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => apply();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [theme]);

  return <>{children}</>;
}
