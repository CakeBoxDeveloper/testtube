"use client";

import { useThemeStore } from "@/stores/useThemeStore";
import { ICONS } from "@/lib/assets";
import { IconButton } from "@/components/ui/IconButton";

const iconByTheme = {
  dark: ICONS.moon,
  light: ICONS.daylight,
  auto: ICONS.dayAndNight,
} as const;

const labelByTheme = {
  dark: "Тёмная тема",
  light: "Светлая тема",
  auto: "Авто",
} as const;

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const cycle = useThemeStore((s) => s.cycle);
  return (
    <IconButton
      src={iconByTheme[theme]}
      onClick={cycle}
      aria-label={labelByTheme[theme]}
      title={labelByTheme[theme]}
    />
  );
}
