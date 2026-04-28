"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { ICONS } from "@/lib/assets";
import { IconButton } from "@/components/ui/IconButton";

interface ContentBlockProps {
  collapsed: boolean;
  onToggle: () => void;
  children?: ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function ContentBlock({
  collapsed,
  onToggle,
  children,
  className,
  ariaLabel,
}: ContentBlockProps) {
  return (
    <motion.section
      aria-label={ariaLabel}
      className={clsx(
        "relative flex flex-col rounded-xl border border-[var(--glass-border)] bg-[var(--bg-panel)] overflow-hidden min-h-0 min-w-0",
        className
      )}
      animate={{
        flexGrow: collapsed ? 0 : 1,
        flexBasis: collapsed ? 50 : "auto",
      }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="absolute top-2 right-2 z-10">
        <IconButton
          src={collapsed ? ICONS.expand : ICONS.minimize}
          size={28}
          iconSize={12}
          onClick={onToggle}
          aria-label={collapsed ? "Развернуть" : "Свернуть"}
        />
      </div>
      <div
        className={clsx(
          "flex-1 transition-opacity duration-300",
          collapsed && "opacity-0 pointer-events-none"
        )}
      >
        {children}
      </div>
    </motion.section>
  );
}
