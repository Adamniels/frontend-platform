"use client";

import type { ReactNode, CSSProperties, MouseEvent } from "react";
import { useRef } from "react";
import { animate } from "animejs";
import { prefersReducedMotion } from "@/lib/anime/motion";
import { cn } from "@/lib/utils/cn";
import styles from "./JarvisButton.module.css";

export type JarvisButtonVariant = "primary" | "ghost" | "outline";

type JarvisButtonProps = {
  label: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  variant?: JarvisButtonVariant;
  /** `sm` = mono uppercase HUD control; `md` = default sans body button */
  size?: "sm" | "md";
  icon?: ReactNode;
  type?: "button" | "submit";
  className?: string;
  style?: CSSProperties;
};

export function JarvisButton({
  label,
  onClick,
  variant = "ghost",
  size = "md",
  icon,
  type = "button",
  className,
  style,
}: JarvisButtonProps) {
  const ringRef = useRef<HTMLSpanElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);

  function handleMouseEnter() {
    if (prefersReducedMotion() || !ringRef.current) return;
    animate(ringRef.current, {
      scale: [1, 1.7],
      opacity: [0.55, 0],
      duration: 520,
      ease: "outExpo",
    });
  }

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (!prefersReducedMotion() && rippleRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      rippleRef.current.style.left = `${x}px`;
      rippleRef.current.style.top = `${y}px`;
      animate(rippleRef.current, {
        scale: [0, 3.5],
        opacity: [0.4, 0],
        duration: 420,
        ease: "outExpo",
      });
    }
    onClick?.(e);
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={cn(
        styles.btn,
        styles[`variant_${variant}` as keyof typeof styles],
        size === "sm" && styles.size_sm,
        className,
      )}
      style={style}
    >
      <span ref={ringRef} className={styles.ring} aria-hidden />
      <span ref={rippleRef} className={styles.ripple} aria-hidden />
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      {label}
    </button>
  );
}
