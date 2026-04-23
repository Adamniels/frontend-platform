"use client";

import type { UserSettings } from "@/lib/api/adapters/settings";
import { SettingsClient } from "./SettingsClient";
import styles from "./settings-experience.module.css";

type SettingsViewProps = { settings: UserSettings } | { error: unknown };

export function SettingsView(props: SettingsViewProps) {
  if ("error" in props) {
    return (
      <div className={styles.errorPage}>
        <p>Could not load settings.</p>
      </div>
    );
  }
  return <SettingsClient settings={props.settings} />;
}
