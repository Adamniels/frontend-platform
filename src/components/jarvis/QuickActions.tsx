"use client";

import { useRouter } from "next/navigation";
import { JarvisIcon } from "./JarvisIcon";
import styles from "./QuickActions.module.css";

const ACTIONS = [
  { label: "Summarize latest AI news", icon: "news" as const, href: "/news" },
  { label: "Explain quantum computing", icon: "brain" as const, href: "/side-learning" },
  { label: "Plan my learning path", icon: "path" as const, href: "/side-learning" },
  { label: "Analyze a document", icon: "doc" as const, href: "/saved-items" },
];

export function QuickActions() {
  const router = useRouter();

  return (
    <div className={styles.grid}>
      {ACTIONS.map((a) => (
        <button
          key={a.label}
          type="button"
          className={styles.btn}
          onClick={() => router.push(a.href)}
        >
          <div className={styles.left}>
            <JarvisIcon name={a.icon} size={15} color="var(--accent)" />
            <span>{a.label}</span>
          </div>
          <JarvisIcon name="chevron" size={13} color="rgba(232,237,248,0.25)" />
        </button>
      ))}
    </div>
  );
}
