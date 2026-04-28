"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import clsx from "clsx";
import { Overlay } from "./Overlay";

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  closeOnBackdrop?: boolean;
}

export function Modal({
  open,
  onClose,
  children,
  className,
  closeOnBackdrop = true,
}: ModalProps) {
  return (
    <Overlay open={open} onClose={onClose} closeOnBackdrop={closeOnBackdrop}>
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        className={clsx(
          "relative w-[calc(100%-32px)] max-w-[400px] rounded-xl border border-[var(--glass-border)] bg-[var(--bg-elevated)] p-5",
          className
        )}
      >
        {children}
      </motion.div>
    </Overlay>
  );
}
