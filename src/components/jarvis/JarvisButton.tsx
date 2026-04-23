"use client";

import type { ReactNode, CSSProperties, MouseEventHandler } from "react";
import { cn } from "@/lib/utils/cn";
import styles from "./JarvisButton.module.css";

export type JarvisButtonVariant = "primary" | "ghost" | "outline";

type JarvisButtonProps = {
  label: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: JarvisButtonVariant;
  icon?: ReactNode;
  type?: "button" | "submit";
  className?: string;
  style?: CSSProperties;
};

export function JarvisButton({
  label,
  onClick,
  variant = "ghost",
  icon,
  type = "button",
  className,
  style,
}: JarvisButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(styles.btn, styles[`variant_${variant}` as keyof typeof styles], className)}
      style={style}
    >
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      {label}
    </button>
  );
}
