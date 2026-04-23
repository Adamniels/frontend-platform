"use client";

import type { UserProfile } from "@/lib/api/adapters/profile";
import { ProfileClient } from "./ProfileClient";
import styles from "./profile-experience.module.css";

type ProfileViewProps = { profile: UserProfile } | { error: unknown };

export function ProfileView(props: ProfileViewProps) {
  if ("error" in props) {
    return (
      <div className={styles.page}>
        <p className={styles.err}>Could not load profile.</p>
      </div>
    );
  }
  return <ProfileClient profile={props.profile} />;
}
