"use client";

import clsx from "clsx";
import {
  type ClipboardEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
} from "react";

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
  onComplete?: (value: string) => void;
}

export function PinInput({
  value,
  onChange,
  length = 4,
  autoFocus,
  disabled,
  className,
  onComplete,
}: PinInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const setAt = (i: number, ch: string) => {
    const next = (value + " ".repeat(length))
      .slice(0, length)
      .split("");
    next[i] = ch;
    const joined = next.join("").replace(/\s+$/, "");
    onChange(joined);
    if (joined.length === length && onComplete) onComplete(joined);
  };

  const focusAt = (i: number) => {
    if (i < 0 || i >= length) return;
    refs.current[i]?.focus();
    refs.current[i]?.select();
  };

  const handleInput = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) {
      setAt(i, "");
      return;
    }
    setAt(i, digit);
    if (i < length - 1) focusAt(i + 1);
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (value[i]) {
        setAt(i, "");
      } else if (i > 0) {
        focusAt(i - 1);
        setAt(i - 1, "");
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAt(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAt(i + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!digits) return;
    e.preventDefault();
    onChange(digits);
    focusAt(Math.min(digits.length, length - 1));
    if (digits.length === length && onComplete) onComplete(digits);
  };

  return (
    <div className={clsx("flex gap-2 justify-center", className)}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          autoComplete="one-time-code"
          disabled={disabled}
          value={value[i] ?? ""}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={clsx(
            "w-12 h-14 text-center text-xl font-semibold tabular-nums",
            "bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg",
            "text-[var(--text-primary)]",
            "focus:outline-none focus:border-[var(--text-primary)]",
            "disabled:opacity-40"
          )}
        />
      ))}
    </div>
  );
}
