"use client";

import { useEffect, useMemo, useState } from "react";
import type { InputNeededItem } from "@/lib/api/adapters/input-needed";
import { JarvisButton } from "@/components/jarvis/JarvisButton";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import { usePendingInputCount } from "@/components/layout/PendingInputContext";
import styles from "./input-needed.module.css";

type InputNeededViewProps = { items: InputNeededItem[] } | { loadError: string };

export function InputNeededView(props: InputNeededViewProps) {
  const loadError = "loadError" in props ? props.loadError : null;
  const items = useMemo((): InputNeededItem[] => {
    if ("loadError" in props) return [];
    return props.items;
  }, [props]);
  const { setCount } = usePendingInputCount();
  const [dismissed, setDismissed] = useState<number[]>([]);
  const [acted, setActed] = useState<number[]>([]);

  const pending = useMemo(
    () => items.filter((i) => !dismissed.includes(i.id) && !acted.includes(i.id)),
    [items, dismissed, acted],
  );

  useEffect(() => {
    if (loadError) {
      setCount(0);
      return;
    }
    setCount(pending.length);
  }, [loadError, pending.length, setCount]);

  if (loadError) {
    return (
      <div className={styles.page}>
        <JarvisInlineError title="Input needed" message={loadError} />
      </div>
    );
  }

  return (
    <div className={`${styles.page} screenEnter`}>
      <div className={styles.intro}>
        <h2 className={styles.h2}>Input needed</h2>
        <p className={styles.lead}>
          {pending.length > 0
            ? `${pending.length} item${pending.length > 1 ? "s" : ""} need your attention.`
            : "All caught up — nothing pending."}
        </p>
      </div>

      {pending.length === 0 ? (
        <JarvisCard className={styles.emptyCard} hover={false}>
          <div className={styles.check}>✓</div>
          <div className={styles.emptyTitle}>All done!</div>
          <div className={styles.emptySub}>No pending inputs. Check back later.</div>
        </JarvisCard>
      ) : null}

      {pending.map((item) => (
        <JarvisCard
          key={item.id}
          className={styles.item}
          hover={false}
          style={{
            borderColor: item.urgent ? "rgba(239,68,68,0.3)" : undefined,
            background: item.urgent ? "rgba(239,68,68,0.04)" : undefined,
          }}
        >
          <div className={styles.row}>
            <div className={styles.body}>
              <div className={styles.meta}>
                <JarvisTag label={item.type} color={item.urgent ? "#ef4444" : undefined} />
                {item.urgent ? <span className={styles.urgent}>Urgent</span> : null}
              </div>
              <div className={styles.title}>{item.text}</div>
              <p className={styles.detail}>{item.detail}</p>
            </div>
            <div className={styles.actions}>
              <JarvisButton label="Act" variant="primary" onClick={() => setActed((a) => [...a, item.id])} />
              <JarvisButton label="Skip" variant="ghost" onClick={() => setDismissed((d) => [...d, item.id])} />
            </div>
          </div>
        </JarvisCard>
      ))}
    </div>
  );
}
