"use client";

import type { ReactNode, CSSProperties, MouseEvent } from "react";
import { cn } from "@/lib/utils/cn";
import styles from "./JarvisCard.module.css";

type JarvisCardProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  hover?: boolean;
};

export function JarvisCard({
  children,
  className,
  style,
  onClick,
  hover = true,
}: JarvisCardProps) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(styles.card, hover && styles.cardHoverable, onClick && styles.clickable, className)}
      style={style}
      data-card
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick(e as unknown as MouseEvent<HTMLDivElement>);
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
