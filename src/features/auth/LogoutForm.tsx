"use client";

import { useAuthStore } from "@/stores/useAuthStore";

interface LogoutFormProps {
  onClose: () => void;
}

export function LogoutForm({ onClose }: LogoutFormProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="space-y-5">
      <header className="text-center space-y-1">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Выход</h2>
        {user && (
          <p className="text-xs text-[var(--text-tertiary)]">
            ID {user.id} · {user.gender === "male" ? "M" : "F"} · {user.age}
          </p>
        )}
      </header>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onClose}
          className="h-11 rounded-lg border border-[var(--glass-border)] text-sm text-[var(--text-secondary)] hover:bg-[var(--glass-bg)] transition-colors"
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={() => {
            logout();
            onClose();
          }}
          className="h-11 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
        >
          Выйти
        </button>
      </div>
    </div>
  );
}
