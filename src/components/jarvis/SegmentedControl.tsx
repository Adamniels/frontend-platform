"use client";

import { cn } from "@/lib/utils/cn";
import styles from "./SegmentedControl.module.css";

export type SegmentedControlItem = {
  id: string;
  label: string;
  count?: number;
  countAlert?: boolean;
};

type SegmentedControlProps = {
  items: SegmentedControlItem[];
  value: string;
  onChange: (id: string) => void;
  "aria-label": string;
  className?: string;
  /** Full-width bar (no wrap), e.g. memory-style strip */
  fill?: boolean;
  /** Shorter segments + type scale to align with toolbar search/titles */
  compact?: boolean;
};

export function SegmentedControl({
  items,
  value,
  onChange,
  "aria-label": ariaLabel,
  className,
  fill = false,
  compact = false,
}: SegmentedControlProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        styles.root,
        fill && styles.rootFill,
        compact && styles.rootCompact,
        className,
      )}
    >
      {items.map((item, index) => {
        const active = value === item.id;
        const isLast = index === items.length - 1;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn(
              styles.segment,
              active && styles.segmentActive,
              fill && isLast && styles.segmentStripLast,
            )}
            onClick={() => onChange(item.id)}
          >
            {item.label}
            {item.count != null ? (
              <span
                className={cn(
                  styles.badge,
                  item.countAlert && item.count > 0 && styles.badgeAlert,
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
