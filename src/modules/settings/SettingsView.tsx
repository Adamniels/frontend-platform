"use client";

import type { UserSettings } from "@/lib/api/adapters/settings";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { SettingsClient } from "./SettingsClient";
import styles from "./settings-experience.module.css";

type SettingsViewProps = { settings: UserSettings } | { loadError: string };

export function SettingsView(props: SettingsViewProps) {
  if ("loadError" in props) {
    return (
      <div className={styles.errorPage}>
        <JarvisInlineError title="Settings" message={props.loadError} />
      </div>
    );
  }
  return <SettingsClient settings={props.settings} />;
}
