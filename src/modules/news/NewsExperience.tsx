"use client";

import { useMemo, useState } from "react";
import { JarvisButton } from "@/components/jarvis/JarvisButton";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import styles from "./news-experience.module.css";

type Article = {
  id: number;
  cat: string;
  title: string;
  summary: string;
  relevance: string;
  time: string;
  readTime: string;
  tags: string[];
  urgent?: boolean;
};

const ARTICLES: Article[] = [
  {
    id: 1,
    cat: "AI",
    title: "Agentic Systems Are Reshaping Enterprise Workflows",
    summary:
      "New multi-agent architectures reduce operational costs by 40% while handling complex decision trees autonomously.",
    relevance: "Matches your interest in AI Agents and Business Applications.",
    time: "2h ago",
    readTime: "6 min",
    tags: ["Agents", "Enterprise"],
  },
  {
    id: 2,
    cat: "Policy",
    title: "EU AI Act Implementation: What Changes in Q3 2026",
    summary:
      "Compliance deadlines accelerate for foundation model providers. Key obligations around transparency and risk classification take effect.",
    relevance: "Relevant to your AI Ethics and Policy focus area.",
    time: "4h ago",
    readTime: "8 min",
    tags: ["EU", "Regulation"],
    urgent: true,
  },
  {
    id: 3,
    cat: "Science",
    title: "MIT Quantum Error Correction Breakthrough",
    summary:
      "New topological qubit approach reduces decoherence by orders of magnitude, bringing practical quantum advantage closer to reality.",
    relevance: "Aligns with your recent exploration of Quantum Computing.",
    time: "6h ago",
    readTime: "10 min",
    tags: ["Quantum", "MIT"],
  },
];

const CATEGORIES = ["All", "AI", "Science", "Tech", "Policy", "Business"];

export function NewsExperience() {
  const [selected, setSelected] = useState<number | null>(null);
  const [filter, setFilter] = useState("All");
  const [saved, setSaved] = useState<number[]>([]);

  const filtered = useMemo(
    () => (filter === "All" ? ARTICLES : ARTICLES.filter((a) => a.cat === filter)),
    [filter],
  );

  const art = selected ? ARTICLES.find((a) => a.id === selected) : null;

  if (art) {
    return (
      <div className={`${styles.page} screenEnter`}>
        <button type="button" className={styles.back} onClick={() => setSelected(null)}>
          ← Back to feed
        </button>
        <JarvisCard className={styles.block} hover={false}>
          <div className={styles.tags}>
            {art.tags.map((t) => (
              <JarvisTag key={t} label={t} color="var(--accent)" />
            ))}
          </div>
          <h2 className={styles.title}>{art.title}</h2>
          <div className={styles.meta}>
            {art.time} · {art.readTime} read
          </div>
        </JarvisCard>
        <JarvisCard
          className={styles.block}
          hover={false}
          style={{
            borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)",
            background: "color-mix(in srgb, var(--accent) 5%, transparent)",
          }}
        >
          <div className={styles.relevanceLabel}>Why this is relevant</div>
          <p className={styles.body}>{art.relevance}</p>
        </JarvisCard>
        <JarvisCard className={styles.block} hover={false}>
          <p className={styles.body}>
            {art.summary} Further analysis indicates this trend will accelerate through 2027 as tooling matures and
            organizational adoption compounds.
          </p>
        </JarvisCard>
      </div>
    );
  }

  return (
    <div className={`${styles.page} screenEnter`}>
      <div className={styles.toolbar}>
        <h2 className={styles.h2}>Personalized feed</h2>
        <div className={styles.filters}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={filter === c ? styles.chipOn : styles.chip}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      {filtered.map((a) => (
        <JarvisCard key={a.id} onClick={() => setSelected(a.id)} className={styles.listCard}>
          <div className={styles.cardRow}>
            <div className={styles.cardMain}>
              <div className={styles.tags}>
                <JarvisTag label={a.cat} />
                {a.tags.map((t) => (
                  <JarvisTag key={t} label={t} color="var(--accent)" />
                ))}
                {a.urgent ? <JarvisTag label="Priority" color="#ff9500" /> : null}
              </div>
              <h3 className={styles.cardTitle}>{a.title}</h3>
              <p className={styles.cardSummary}>{a.summary}</p>
              <div className={styles.cardMeta}>
                {a.time} · {a.readTime} read
              </div>
            </div>
            <div className={styles.cardActions}>
              <JarvisButton
                label={saved.includes(a.id) ? "Saved ✓" : "Save"}
                variant={saved.includes(a.id) ? "primary" : "ghost"}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setSaved((s) => (s.includes(a.id) ? s.filter((x) => x !== a.id) : [...s, a.id]));
                }}
                className={styles.saveBtn}
              />
            </div>
          </div>
        </JarvisCard>
      ))}
    </div>
  );
}
