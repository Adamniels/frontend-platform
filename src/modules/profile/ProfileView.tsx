"use client";

import type { UserProfile } from "@/lib/api/adapters/profile";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { ProfileClient } from "./ProfileClient";
import styles from "./profile-experience.module.css";

type ProfileViewProps = { profile: UserProfile } | { loadError: string };

export function ProfileView(props: ProfileViewProps) {
  if ("loadError" in props) {
    return (
      <div className={styles.page}>
        <JarvisInlineError title="Profile" message={props.loadError} />
      </div>
    );
  }
  return <ProfileClient profile={props.profile} />;
}
