"use client";

import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";
import { Icon } from "./Icon";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  src: string;
  size?: number;
  iconSize?: number;
  tinted?: boolean;
}

export function IconButton({
  src,
  size = 32,
  iconSize,
  tinted = true,
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={clsx(
        "inline-flex items-center justify-center rounded-md transition-colors hover:bg-white/5 active:bg-white/10 disabled:opacity-40 disabled:pointer-events-none",
        className
      )}
      style={{ width: size, height: size }}
      {...rest}
    >
      <Icon src={src} size={iconSize ?? Math.round(size * 0.55)} tinted={tinted} />
    </button>
  );
}
