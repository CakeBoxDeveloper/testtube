"use client";

const PREFERRED_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/ogg",
  "audio/mp4;codecs=mp4a.40.2",
  "audio/mp4",
  "audio/aac",
  "audio/wav",
];

export function pickMimeType(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const MR = (window as unknown as { MediaRecorder?: typeof MediaRecorder })
    .MediaRecorder;
  if (!MR) return undefined;
  for (const type of PREFERRED_TYPES) {
    try {
      if (MR.isTypeSupported(type)) return type;
    } catch {
      // some browsers throw on weird types
    }
  }
  return undefined;
}

export function fileExtensionForMime(mime: string): string {
  const lower = mime.toLowerCase();
  if (lower.includes("mp4") || lower.includes("aac")) return "m4a";
  if (lower.includes("webm")) return "webm";
  if (lower.includes("ogg")) return "ogg";
  if (lower.includes("wav")) return "wav";
  return "bin";
}

export function isMicSupported(): boolean {
  if (typeof window === "undefined") return false;
  const md = navigator.mediaDevices;
  if (!md || typeof md.getUserMedia !== "function") return false;
  const MR = (window as unknown as { MediaRecorder?: typeof MediaRecorder })
    .MediaRecorder;
  if (!MR) return false;
  return true;
}
