"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fileExtensionForMime, pickMimeType } from "@/lib/voice";

export type RecorderStatus = "idle" | "recording" | "processing" | "error";

interface RecordResult {
  blob: Blob;
  mime: string;
  filename: string;
  durationMs: number;
}

interface UseVoiceRecorderResult {
  status: RecorderStatus;
  level: number; // 0..1, for visualization
  error: string | null;
  start: () => Promise<void>;
  stop: () => Promise<RecordResult | null>;
  cancel: () => void;
}

export function useVoiceRecorder(): UseVoiceRecorderResult {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const stopResolverRef = useRef<((r: RecordResult | null) => void) | null>(null);
  const cancelledRef = useRef(false);

  const cleanup = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    } catch {
      // noop
    }
    try {
      audioCtxRef.current?.close();
    } catch {
      // noop
    }
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
    recorderRef.current = null;
    chunksRef.current = [];
    setLevel(0);
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const start = useCallback(async () => {
    if (status === "recording" || status === "processing") return;
    setError(null);
    cancelledRef.current = false;

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.name === "NotAllowedError"
            ? "Доступ к микрофону запрещён"
            : e.message
          : "Не удалось получить доступ к микрофону";
      setError(msg);
      setStatus("error");
      return;
    }

    streamRef.current = stream;
    const mime = pickMimeType();
    let recorder: MediaRecorder;
    try {
      recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
    } catch (e) {
      cleanup();
      setError(e instanceof Error ? e.message : "MediaRecorder не поддерживается");
      setStatus("error");
      return;
    }

    chunksRef.current = [];
    recorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
    };
    recorder.onstop = () => {
      const resolver = stopResolverRef.current;
      stopResolverRef.current = null;
      if (cancelledRef.current) {
        cleanup();
        cancelledRef.current = false;
        setStatus("idle");
        resolver?.(null);
        return;
      }
      const actualMime = recorder.mimeType || mime || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: actualMime });
      const ext = fileExtensionForMime(actualMime);
      const filename = `voice-${Date.now()}.${ext}`;
      cleanup();
      setStatus("processing");
      resolver?.({
        blob,
        mime: actualMime,
        filename,
        durationMs: Date.now() - startedAtRef.current,
      });
    };

    // Audio level analyser
    try {
      const Ctor =
        (window as unknown as { AudioContext?: typeof AudioContext })
          .AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (Ctor) {
        const ctx = new Ctor();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) sum += data[i];
          const avg = sum / data.length / 255;
          setLevel(Math.min(1, avg * 1.6));
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      }
    } catch {
      // analyser is best-effort
    }

    recorderRef.current = recorder;
    startedAtRef.current = Date.now();
    recorder.start();
    setStatus("recording");
  }, [cleanup, status]);

  const stop = useCallback(() => {
    return new Promise<RecordResult | null>((resolve) => {
      const r = recorderRef.current;
      if (!r || r.state === "inactive") {
        resolve(null);
        return;
      }
      stopResolverRef.current = resolve;
      try {
        r.stop();
      } catch {
        cleanup();
        setStatus("idle");
        resolve(null);
      }
    });
  }, [cleanup]);

  const cancel = useCallback(() => {
    const r = recorderRef.current;
    if (!r) {
      cleanup();
      setStatus("idle");
      return;
    }
    cancelledRef.current = true;
    try {
      r.stop();
    } catch {
      cleanup();
      cancelledRef.current = false;
      setStatus("idle");
    }
  }, [cleanup]);

  return { status, level, error, start, stop, cancel };
}
