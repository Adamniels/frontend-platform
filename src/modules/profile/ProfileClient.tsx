"use client";

import type { UserProfile } from "@/lib/api/adapters/profile";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import { ProfileMemoryPanel } from "@/modules/memory-center/ProfileMemoryPanel";
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
      <div className={styles.interestBlock}>
        <div className={styles.sectionTitle}>Interests &amp; goals</div>
        <p className={styles.interestLead}>
          High-trust fields used for personalization. Stored as explicit profile memory; same data as Memory →
          Profile.
        </p>
        <ProfileMemoryPanel />
      </div>
    </div>
  );
}
