"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { isMicSupported } from "@/lib/voice";
import { transcribe } from "@/lib/transcribe-api";

interface VoiceButtonProps {
  onText: (text: string) => void;
  disabled?: boolean;
  size?: number;
  language?: string;
  className?: string;
  /** When true, transcription is appended; when false, it replaces. Default: append. */
  append?: boolean;
  /** Called when an error occurs. */
  onError?: (msg: string) => void;
}

export function VoiceButton({
  onText,
  disabled,
  size = 40,
  language = "ru",
  className,
  onError,
}: VoiceButtonProps) {
  const recorder = useVoiceRecorder();
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSupported(isMicSupported());
  }, []);

  useEffect(() => {
    if (recorder.error) {
      setError(recorder.error);
      onError?.(recorder.error);
    }
  }, [recorder.error, onError]);

  if (!supported) return null;

  const handleClick = async () => {
    if (disabled || recorder.status === "processing") return;

    if (recorder.status === "recording") {
      const result = await recorder.stop();
      if (!result) return;
      try {
        const { text } = await transcribe(result.blob, result.filename, language);
        if (text) onText(text);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Ошибка распознавания";
        setError(msg);
        onError?.(msg);
      }
      return;
    }

    setError(null);
    await recorder.start();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    recorder.cancel();
  };

  const isRecording = recorder.status === "recording";
  const isProcessing = recorder.status === "processing";
  const level = recorder.level;

  return (
    <div className={clsx("relative inline-flex shrink-0", className)}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isProcessing}
        aria-label={
          isRecording
            ? "Остановить и распознать"
            : isProcessing
              ? "Распознаю…"
              : "Голосовой ввод"
        }
        title={error ?? undefined}
        style={{ width: size, height: size }}
        className={clsx(
          "relative inline-flex items-center justify-center rounded-md transition-colors overflow-hidden",
          "border border-[var(--glass-border)]",
          isRecording
            ? "bg-red-500/20 border-red-500/40"
            : isProcessing
              ? "bg-[var(--glass-bg)]"
              : "bg-[var(--glass-bg)] hover:bg-white/10",
          error && !isRecording && !isProcessing && "border-red-500/40",
          "disabled:opacity-50 disabled:pointer-events-none"
        )}
      >
        {isRecording && (
          <span
            aria-hidden
            className="absolute inset-0 bg-red-500/15"
            style={{
              transform: `scale(${1 + level * 0.5})`,
              opacity: 0.4 + level * 0.6,
              transition: "transform 80ms linear, opacity 80ms linear",
            }}
          />
        )}
        {isProcessing ? (
          <SpinnerDots />
        ) : isRecording ? (
          <StopSquare />
        ) : (
          <MicSvg />
        )}
      </button>
      {isRecording && (
        <button
          type="button"
          onClick={handleCancel}
          aria-label="Отменить запись"
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--bg-elevated)] border border-[var(--glass-border)] flex items-center justify-center text-[8px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
        >
          ✕
        </button>
      )}
    </div>
  );
}

function MicSvg() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[var(--text-secondary)] relative z-10"
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
      <path d="M8 21h8" />
    </svg>
  );
}

function StopSquare() {
  return (
    <span className="relative z-10 w-2.5 h-2.5 bg-red-300 rounded-sm" />
  );
}

function SpinnerDots() {
  return (
    <span className="relative z-10 inline-flex gap-0.5">
      <Dot delay={0} />
      <Dot delay={0.15} />
      <Dot delay={0.3} />
    </span>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="w-1 h-1 rounded-full bg-[var(--text-secondary)]"
      style={{
        animation: "msePulse 1.2s ease-in-out infinite",
        animationDelay: `${delay}s`,
      }}
    />
  );
}
