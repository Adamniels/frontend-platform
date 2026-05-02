"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { prefersReducedMotion } from "@/lib/anime/motion";
import styles from "./ProgressRing.module.css";

type ProgressRingProps = {
  value?: number;
  size?: number;
  stroke?: number;
  color?: string;
  bg?: string;
  label?: string;
};

export function ProgressRing({
  value = 0,
  size = 100,
  stroke = 7,
  color = "var(--accent)",
  bg = "rgba(0,212,255,0.10)",
  label,
}: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const progressRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.style.strokeDashoffset = String(offset);
      return;
    }

    const anim = animate(el, {
      strokeDashoffset: [circ, offset],
      duration: 1200,
      ease: "outExpo",
      onComplete: () => {
        animate(el, {
          filter: [
            `drop-shadow(0 0 4px ${color})`,
            `drop-shadow(0 0 14px ${color})`,
            `drop-shadow(0 0 5px ${color})`,
          ],
          duration: 500,
          ease: "inOutSine",
        });
      },
    });

    return () => { anim.pause(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, circ, offset, color]);

  return (
    <div className={styles.wrap} style={{ width: size, height: size }}>
      <svg
        className={styles.svg}
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden
      >
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
        <circle
          ref={progressRef}
          className={styles.progress}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={circ}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
      <div className={styles.center}>
        <span className={styles.value} style={{ fontSize: size * 0.2 }}>
          {value}
          <span className={styles.pct} style={{ fontSize: size * 0.11 }}>
            %
          </span>
        </span>
        {label ? <span className={styles.label}>{label}</span> : null}
      </div>
    </div>
  );
}
