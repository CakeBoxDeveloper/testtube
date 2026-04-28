"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { MouseEvent, ReactNode } from "react";
import { useEffect } from "react";

interface OverlayProps {
  open: boolean;
  onClose?: () => void;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  children: ReactNode;
  className?: string;
}

export function Overlay({
  open,
  onClose,
  closeOnBackdrop = true,
  closeOnEscape = true,
  children,
  className,
}: OverlayProps) {
  useEffect(() => {
    if (!open || !closeOnEscape || !onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeOnEscape, onClose]);

  const handleBackdrop = (e: MouseEvent<HTMLDivElement>) => {
    if (!closeOnBackdrop || !onClose) return;
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={`absolute inset-0 z-50 flex items-center justify-center bg-[var(--bg-overlay)] backdrop-blur-md ${className ?? ""}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={handleBackdrop}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
