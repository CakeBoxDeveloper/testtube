import clsx from "clsx";
import type { ImgHTMLAttributes } from "react";

interface IconProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "alt"> {
  src: string;
  alt?: string;
  size?: number | string;
  tinted?: boolean;
}

export function Icon({
  src,
  alt = "",
  size = 16,
  tinted = true,
  className,
  style,
  ...rest
}: IconProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={typeof size === "number" ? size : undefined}
      height={typeof size === "number" ? size : undefined}
      className={clsx(tinted && "icon-tinted", className)}
      style={{
        width: size,
        height: size,
        ...style,
      }}
      draggable={false}
      {...rest}
    />
  );
}
