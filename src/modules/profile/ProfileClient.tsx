"use client";

import { useState } from "react";
import type { UserProfile } from "@/lib/api/adapters/profile";
import { JarvisButton } from "@/components/jarvis/JarvisButton";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import styles from "./profile-experience.module.css";

type ProfileClientProps = { profile: UserProfile };

export function ProfileClient({ profile }: ProfileClientProps) {
  const [interests, setInterests] = useState([
    "AI Ethics",
    "Machine Learning",
    "AI Policy",
    "Agentic Systems",
  ]);
  const [depth, setDepth] = useState(3);
  const [sessionLen, setSessionLen] = useState(45);
  const [newInterest, setNewInterest] = useState("");

  const depthLabel = ["", "Overview", "Introductory", "Intermediate", "Advanced", "Expert"][depth] ?? "";

  return (
    <div className={`${styles.page} screenEnter`}>
      <h2 className={styles.h2}>Profile</h2>
      <JarvisCard hover={false} className={styles.card}>
        <div className={styles.hero}>
          <div className={styles.avatar} aria-hidden>
            OP
          </div>
          <div>
            <div className={styles.name}>{profile.displayName}</div>
            <div className={styles.email}>{profile.email}</div>
            <div className={styles.tags}>
              <JarvisTag label="Advanced learner" />
              <JarvisTag label="AI focused" color="var(--accent)" />
            </div>
          </div>
        </div>
      </JarvisCard>
      <JarvisCard hover={false} className={styles.card}>
        <div className={styles.sectionTitle}>Interests</div>
        <div className={styles.tagRow}>
          {interests.map((i) => (
            <button
              key={i}
              type="button"
              className={styles.interestChip}
              onClick={() => setInterests((a) => a.filter((x) => x !== i))}
            >
              {i} ×
            </button>
          ))}
        </div>
        <div className={styles.addRow}>
          <input
            className={styles.input}
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newInterest.trim()) {
                setInterests((a) => [...a, newInterest.trim()]);
                setNewInterest("");
              }
            }}
            placeholder="Add interest…"
          />
          <JarvisButton
            label="Add"
            variant="primary"
            onClick={() => {
              if (newInterest.trim()) {
                setInterests((a) => [...a, newInterest.trim()]);
                setNewInterest("");
              }
            }}
          />
        </div>
      </JarvisCard>
      <div className={styles.grid2}>
        <JarvisCard hover={false} className={styles.card}>
          <div className={styles.sectionTitle}>Content depth</div>
          <div className={styles.muted}>{depthLabel}</div>
          <input
            type="range"
            min={1}
            max={5}
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className={styles.range}
          />
          <div className={styles.rangeLabels}>
            <span>Overview</span>
            <span>Expert</span>
          </div>
        </JarvisCard>
        <JarvisCard hover={false} className={styles.card}>
          <div className={styles.sectionTitle}>Session length</div>
          <div className={styles.muted}>{sessionLen} minutes</div>
          <input
            type="range"
            min={15}
            max={120}
            step={15}
            value={sessionLen}
            onChange={(e) => setSessionLen(Number(e.target.value))}
            className={styles.range}
          />
          <div className={styles.rangeLabels}>
            <span>15 min</span>
            <span>2 hrs</span>
          </div>
        </JarvisCard>
      </div>
    </div>
  );
}
