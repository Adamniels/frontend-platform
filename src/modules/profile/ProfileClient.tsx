"use client";

import { useId, useState } from "react";
import type { UserProfile } from "@/lib/api/adapters/profile";
import { JarvisButton } from "@/components/jarvis/JarvisButton";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import {
  MOCK_PROFILE_DEPTH,
  MOCK_PROFILE_DEPTH_LABELS,
  MOCK_PROFILE_INTERESTS,
  MOCK_PROFILE_SESSION_LENGTH,
  MOCK_PROFILE_TAGS,
} from "./profile-mock";
import styles from "./profile-experience.module.css";

type ProfileClientProps = { profile: UserProfile };

export function ProfileClient({ profile }: ProfileClientProps) {
  const depthId = useId();
  const sessionId = useId();
  const interestInputId = useId();
  const initials = profile.displayName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "OP";

  // TODO: initialize from GET /api/v1/settings or profile API when available
  const [interests, setInterests] = useState(MOCK_PROFILE_INTERESTS);
  const [depth, setDepth] = useState(MOCK_PROFILE_DEPTH);
  const [sessionLen, setSessionLen] = useState(MOCK_PROFILE_SESSION_LENGTH);
  const [newInterest, setNewInterest] = useState("");

  const depthLabel = MOCK_PROFILE_DEPTH_LABELS[depth] ?? "";

  return (
    <div className={`${styles.page} screenEnter`}>
      <h2 className={styles.h2}>Profile</h2>
      <JarvisCard hover={false} className={styles.card}>
        <div className={styles.hero}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar} aria-hidden>
              {initials}
            </div>
          </div>
          <div>
            <div className={styles.name}>{profile.displayName.toUpperCase()}</div>
            <div className={styles.email}>{profile.email}</div>
            <div className={styles.tags}>
              <JarvisTag label={MOCK_PROFILE_TAGS[0]} />
              <JarvisTag label={MOCK_PROFILE_TAGS[1]} color="var(--accent)" />
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
          <label htmlFor={interestInputId} className={styles.srOnly}>
            Add interest
          </label>
          <input
            id={interestInputId}
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
          <label className={styles.sectionTitle} htmlFor={depthId}>
            Content depth
          </label>
          <div className={styles.muted} id={`${depthId}-desc`}>
            {depthLabel}
          </div>
          <input
            id={depthId}
            type="range"
            min={1}
            max={5}
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className={`${styles.range} ${styles.rangeDepth}`}
            aria-valuemin={1}
            aria-valuemax={5}
            aria-valuenow={depth}
            aria-valuetext={depthLabel}
            aria-describedby={`${depthId}-desc`}
          />
          <div className={styles.rangeLabels}>
            <span>Overview</span>
            <span>Expert</span>
          </div>
        </JarvisCard>
        <JarvisCard hover={false} className={styles.card}>
          <label className={styles.sectionTitle} htmlFor={sessionId}>
            Session length
          </label>
          <div className={styles.muted} id={`${sessionId}-desc`}>
            {sessionLen} minutes
          </div>
          <input
            id={sessionId}
            type="range"
            min={15}
            max={120}
            step={15}
            value={sessionLen}
            onChange={(e) => setSessionLen(Number(e.target.value))}
            className={`${styles.range} ${styles.rangeSession}`}
            aria-valuemin={15}
            aria-valuemax={120}
            aria-valuenow={sessionLen}
            aria-valuetext={`${sessionLen} minutes`}
            aria-describedby={`${sessionId}-desc`}
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
