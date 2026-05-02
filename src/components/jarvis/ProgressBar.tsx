"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { prefersReducedMotion } from "@/lib/anime/motion";
import styles from "./ProgressBar.module.css";

type ProgressBarProps = {
  value: number;
  color?: string;
  label?: string;
  showVal?: boolean;
};

export function ProgressBar({
  value,
  color = "var(--accent)",
  label,
  showVal = true,
}: ProgressBarProps) {
  const fillRef = useRef<HTMLDivElement>(null);
  const clampedValue = Math.min(100, Math.max(0, value));

  useEffect(() => {
    if (!fillRef.current) return;
    if (prefersReducedMotion()) {
      fillRef.current.style.width = `${clampedValue}%`;
      return;
    }
    animate(fillRef.current, {
      width: ["0%", `${clampedValue}%`],
      duration: 900,
      ease: "outExpo",
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clampedValue]);

  return (
    <div className={styles.root}>
      {(label || showVal) && (
        <div className={styles.row}>
          {label ? <span className={styles.label}>{label}</span> : <span />}
          {showVal ? (
            <span className={styles.val} style={{ color }}>
              {value}%
            </span>
          ) : null}
        </div>
      )}
      <div className={styles.track}>
        <div
          ref={fillRef}
          className={styles.fill}
          style={{
            width: 0,
            background: `linear-gradient(90deg, color-mix(in srgb, ${color} 60%, #7c5cbf), ${color})`,
            boxShadow: `0 0 8px color-mix(in srgb, ${color} 50%, transparent)`,
          }}
        />
      </div>
    </div>
  );
}
