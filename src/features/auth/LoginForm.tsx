"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api-client";
import { authApi } from "@/lib/users-api";
import { useAuthStore } from "@/stores/useAuthStore";
import { PinInput } from "@/components/ui/PinInput";

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoginDate = useAuthStore((s) => s.setLoginDate);

  const [id, setId] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const idValid = /^\d{4}$/.test(id);
  const pinValid = /^\d{4}$/.test(pin);
  const canSubmit = idValid && pinValid && !busy;

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      const { user } = await authApi.login(Number(id), pin);
      setUser(user);
      setLoginDate(Date.now());
      onSuccess();
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Ошибка входа";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="space-y-5"
    >
      <header className="text-center space-y-1">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Вход</h2>
        <p className="text-xs text-[var(--text-tertiary)]">ID и PIN — по 4 цифры</p>
      </header>

      <div className="space-y-2">
        <label className="block text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] text-center">
          ID
        </label>
        <PinInput value={id} onChange={setId} length={4} autoFocus />
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] text-center">
          PIN
        </label>
        <PinInput value={pin} onChange={setPin} length={4} onComplete={() => void submit()} />
      </div>

      {error && (
        <div className="text-xs text-red-400 text-center">{error}</div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full h-11 rounded-lg bg-[var(--text-primary)] text-[var(--bg-panel)] font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
      >
        {busy ? "..." : "Войти"}
      </button>

      <button
        type="button"
        onClick={onSwitchToRegister}
        className="w-full text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
      >
        Нет аккаунта? Зарегистрироваться
      </button>
    </form>
  );
}
