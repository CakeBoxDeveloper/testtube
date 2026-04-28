"use client";

import clsx from "clsx";
import { useState } from "react";
import { ApiError } from "@/lib/api-client";
import { authApi } from "@/lib/users-api";
import { useAuthStore } from "@/stores/useAuthStore";
import { PinInput } from "@/components/ui/PinInput";
import type { Gender } from "@/lib/types";

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoginDate = useAuthStore((s) => s.setLoginDate);

  const [id, setId] = useState("");
  const [pin, setPin] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const idValid = /^\d{4}$/.test(id);
  const pinValid = /^\d{4}$/.test(pin);
  const ageNum = Number(age);
  const ageValid = Number.isFinite(ageNum) && ageNum >= 8 && ageNum <= 120;
  const canSubmit = idValid && pinValid && ageValid && gender !== null && !busy;

  const submit = async () => {
    if (!canSubmit || !gender) return;
    setBusy(true);
    setError(null);
    try {
      const { user } = await authApi.register({
        id: Number(id),
        pin,
        age: ageNum,
        gender,
      });
      setUser(user);
      setLoginDate(Date.now());
      onSuccess();
    } catch (e) {
      const msg =
        e instanceof ApiError && e.status === 409
          ? "Этот ID уже занят"
          : e instanceof Error
            ? e.message
            : "Ошибка регистрации";
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
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Регистрация</h2>
        <p className="text-xs text-[var(--text-tertiary)]">Выберите ID и PIN</p>
      </header>

      <div className="space-y-2">
        <label className="block text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] text-center">
          ID (4 цифры)
        </label>
        <PinInput value={id} onChange={setId} length={4} autoFocus />
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] text-center">
          PIN (4 цифры)
        </label>
        <PinInput value={pin} onChange={setPin} length={4} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
            Возраст
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min={8}
            max={120}
            className="w-full h-11 px-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg text-[var(--text-primary)] text-sm tabular-nums focus:outline-none focus:border-[var(--text-primary)]"
            placeholder="25"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
            Пол
          </label>
          <div className="flex gap-1.5">
            {(["male", "female"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={clsx(
                  "flex-1 h-11 rounded-lg border text-sm transition-colors",
                  gender === g
                    ? "border-[var(--text-primary)] text-[var(--text-primary)] bg-[var(--glass-bg)]"
                    : "border-[var(--glass-border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                )}
              >
                {g === "male" ? "M" : "F"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="text-xs text-red-400 text-center">{error}</div>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full h-11 rounded-lg bg-[var(--text-primary)] text-[var(--bg-panel)] font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
      >
        {busy ? "..." : "Создать"}
      </button>

      <button
        type="button"
        onClick={onSwitchToLogin}
        className="w-full text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
      >
        Уже есть аккаунт? Войти
      </button>
    </form>
  );
}
