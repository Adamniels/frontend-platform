"use client";

import { useState } from "react";
import { JarvisButton } from "@/components/jarvis/JarvisButton";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import { ProgressBar } from "@/components/jarvis/ProgressBar";
import { MOCK_HISTORY, MOCK_SECTIONS, MOCK_TOPICS } from "./side-learning-mock";
import styles from "./side-learning-experience.module.css";

function diffColor(d: string) {
  if (d === "Beginner") return "#34d399";
  if (d === "Intermediate") return "#ff9500";
  return "#ff4466";
}

export function SideLearningExperience() {
  const [view, setView] = useState<"topics" | "history">("topics");
  const [activeTopic, setActiveTopic] = useState<number | null>(null);
  const [session, setSession] = useState(false);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);

  if (activeTopic && session) {
    const topic = MOCK_TOPICS.find((t) => t.id === activeTopic)!;
    const sec = MOCK_SECTIONS[sectionIdx]!;
    return (
      <div className={`${styles.page} ${styles.split} screenEnter`}>
        <div className={styles.navCol}>
          {MOCK_SECTIONS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={i === sectionIdx ? styles.navBtnOn : styles.navBtn}
              style={{ color: completed.includes(s.id) ? "#34d399" : undefined }}
              onClick={() => setSectionIdx(i)}
            >
              {s.label}
            </button>
          ))}
          <JarvisButton label="← Topics" variant="ghost" className={styles.backTopics} onClick={() => setSession(false)} />
        </div>
        <div className={styles.mainCol}>
          <div>
            <div className={styles.breadcrumb}>
              {topic.title} · {sectionIdx + 1}/{MOCK_SECTIONS.length}
            </div>
            <h2 className={styles.h2}>{sec.label}</h2>
          </div>
          <ProgressBar value={Math.round((sectionIdx / MOCK_SECTIONS.length) * 100)} showVal={false} />
          <JarvisCard hover={false}>
            <p className={styles.body}>{sec.content}</p>
          </JarvisCard>
          <div className={styles.navActions}>
            {sectionIdx > 0 ? (
              <JarvisButton label="← Prev" variant="ghost" onClick={() => setSectionIdx((i) => i - 1)} />
            ) : (
              <span />
            )}
            <JarvisButton
              label={sectionIdx === MOCK_SECTIONS.length - 1 ? "Complete ✓" : "Mark done →"}
              variant="primary"
              onClick={() => {
                setCompleted((c) => [...c, sec.id]);
                if (sectionIdx < MOCK_SECTIONS.length - 1) setSectionIdx((i) => i + 1);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (view === "history") {
    return (
      <div className={`${styles.page} screenEnter`}>
        <div className={styles.toolbar}>
          <h2 className={styles.h2}>Learning topics</h2>
          <div className={styles.filters}>
            {(["Topics", "History"] as const).map((v) => (
              <button
                key={v}
                type="button"
                className={v === "History" ? styles.chipOn : styles.chip}
                onClick={() => setView(v === "History" ? "history" : "topics")}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <JarvisCard hover={false}>
          {MOCK_HISTORY.map((s, i) => (
            <div
              key={s.title}
              className={styles.historyRow}
              style={{ borderBottom: i < 2 ? "1px solid var(--color-border)" : "none" }}
            >
              <div>
                <div className={styles.historyTitle}>{s.title}</div>
                <div className={styles.historyDate}>{s.date}</div>
              </div>
              <div className={styles.score}>{s.score}</div>
            </div>
          ))}
        </JarvisCard>
      </div>
    );
  }

  return (
    <div className={`${styles.page} screenEnter`}>
      <div className={styles.toolbar}>
        <h2 className={styles.h2}>Learning topics</h2>
        <div className={styles.filters}>
          {(["Topics", "History"] as const).map((v) => (
            <button
              key={v}
              type="button"
              className={v === "Topics" ? styles.chipOn : styles.chip}
              onClick={() => setView(v === "History" ? "history" : "topics")}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      {MOCK_TOPICS.map((topic) => (
        <JarvisCard
          key={topic.id}
          onClick={() => {
            setActiveTopic(topic.id);
            setSession(true);
            setSectionIdx(0);
          }}
          className={styles.topicCard}
        >
          <div className={styles.topicRow}>
            <div className={styles.topicMain}>
              <div className={styles.tags}>
                {topic.tags.map((t) => (
                  <JarvisTag key={t} label={t} />
                ))}
                <JarvisTag label={topic.difficulty} color={diffColor(topic.difficulty)} />
              </div>
              <div className={styles.topicTitle}>{topic.title}</div>
              {topic.progress > 0 ? (
                <div className={styles.topicBar}>
                  <ProgressBar value={topic.progress} showVal={false} />
                </div>
              ) : null}
              <div className={styles.topicMeta}>
                {topic.time} estimated · {topic.progress > 0 ? `${topic.progress}% complete` : "Not started"}
              </div>
            </div>
            <JarvisButton
              label={topic.progress > 0 ? "Resume →" : "Start →"}
              variant={topic.progress > 0 ? "primary" : "ghost"}
              className={styles.topicBtn}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTopic(topic.id);
                setSession(true);
                setSectionIdx(0);
              }}
            />
          </div>
        </JarvisCard>
      ))}
    </div>
  );
}
