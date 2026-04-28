"use client";

import { ICONS } from "@/lib/assets";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthOverlayStore } from "@/stores/useAuthOverlayStore";
import { useHydrated } from "@/hooks/useHydrated";

interface HeaderProps {
  onLogoClick?: () => void;
}

export function Header({ onLogoClick }: HeaderProps) {
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const showAuth = useAuthOverlayStore((s) => s.show);

  const visibleUser = hydrated ? user : null;

  const handleAuthClick = () => {
    showAuth(visibleUser ? "logout" : "login");
  };

  return (
    <header className="flex items-center justify-between px-4 h-[50px] shrink-0 border-b border-[var(--glass-border)]">
      <button
        type="button"
        onClick={onLogoClick}
        className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-white/5"
        aria-label="Логотип"
      >
        <Icon src={ICONS.mse} size={20} />
      </button>

      <div className="flex items-center gap-1">
        {visibleUser && (
          <span className="text-[10px] text-[var(--text-tertiary)] tabular-nums mr-1">
            ID {visibleUser.id}
          </span>
        )}
        <ThemeToggle />
        <IconButton
          src={ICONS.door}
          onClick={handleAuthClick}
          aria-label={visibleUser ? "Выйти" : "Войти"}
          title={visibleUser ? `Выйти (ID ${visibleUser.id})` : "Войти"}
        />
      </div>
    </header>
  );
}
