"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { VIDEOS } from "@/lib/assets";
import type { Gender, MonitorSkin } from "@/lib/types";

interface MonitorVideoProps {
  gender: Gender;
  skin: MonitorSkin;
  onClick?: () => void;
}

export function MonitorVideo({ gender, skin, onClick }: MonitorVideoProps) {
  const src = VIDEOS.outline[gender][skin];
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.load();
    void v.play().catch(() => {});
  }, [src]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Сменить визуализацию"
      className="relative flex-1 w-full flex items-center justify-center cursor-pointer focus:outline-none"
    >
      <AnimatePresence mode="wait">
        <motion.video
          key={src}
          ref={videoRef}
          src={src}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="max-h-full max-w-full object-contain pointer-events-none select-none"
          draggable={false}
        />
      </AnimatePresence>
    </button>
  );
}
