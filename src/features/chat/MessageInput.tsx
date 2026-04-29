"use client";

import clsx from "clsx";
import { useRef, useState } from "react";
import { ICONS } from "@/lib/assets";
import { Icon } from "@/components/ui/Icon";
import { VoiceButton } from "@/components/ui/VoiceButton";

interface MessageInputProps {
  disabled?: boolean;
  onSend: (text: string) => void;
  placeholder?: string;
}

export function MessageInput({ disabled, onSend, placeholder }: MessageInputProps) {
  const [value, setValue] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
    if (ref.current) ref.current.style.height = "";
  };

  const onInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const handleVoice = (text: string) => {
    setVoiceError(null);
    setValue((prev) => {
      const sep = prev && !/[\s\n]$/.test(prev) ? " " : "";
      return prev + sep + text;
    });
    queueMicrotask(() => {
      if (ref.current) {
        ref.current.style.height = "auto";
        ref.current.style.height = Math.min(ref.current.scrollHeight, 120) + "px";
        ref.current.focus();
      }
    });
  };

  return (
    <div className="flex flex-col gap-1 border-t border-[var(--glass-border)] shrink-0">
      <div className="flex items-end gap-2 p-2">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onInput={onInput}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder ?? "Сообщение…"}
          rows={1}
          className="flex-1 resize-none px-3 py-2 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)] outline-none text-sm leading-snug max-h-[120px]"
        />
        <VoiceButton
          size={40}
          disabled={disabled}
          onText={handleVoice}
          onError={(msg) => setVoiceError(msg)}
        />
        <button
          type="button"
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Отправить"
          className={clsx(
            "shrink-0 w-10 h-10 rounded-md flex items-center justify-center transition-colors",
            "border border-[var(--glass-border)] bg-[var(--glass-bg)]",
            "hover:bg-white/10 active:bg-white/15",
            "disabled:opacity-40 disabled:pointer-events-none"
          )}
        >
          <Icon src={ICONS.send} size={14} />
        </button>
      </div>
      {voiceError && (
        <div className="px-3 pb-1 text-[10px] text-red-400">{voiceError}</div>
      )}
    </div>
  );
}
