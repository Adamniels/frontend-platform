"use client";

import type { UserProfile } from "@/lib/api/adapters/profile";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import styles from "./profile-experience.module.css";

type ProfileClientProps = { profile: UserProfile };

export function ProfileClient({ profile }: ProfileClientProps) {
  const initials =
    profile.displayName
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "OP";

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
              <JarvisTag label="Account" />
            </div>
          </div>
        </div>
      </JarvisCard>
      <JarvisCard hover={false} className={styles.cardMuted}>
        <div className={styles.sectionTitle}>Learning preferences</div>
        <p className={styles.placeholderBody}>
          Interests, content depth, and session length are <strong>not stored</strong> by{" "}
          <code className={styles.inlineCode}>GET /api/v1/profile</code> yet. This section will become editable when
          the backend exposes those fields or dedicated settings endpoints.
        </p>
      </JarvisCard>
    </div>
  );
}
