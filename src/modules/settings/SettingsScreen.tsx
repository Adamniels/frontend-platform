"use client";

import { useEffect, useState } from "react";
import type { UserSettings } from "@/lib/api/adapters/settings";
import { LoadingState } from "@/components/ui/LoadingState";
import { getUserSettings } from "./api/get-settings";
import { SettingsView } from "./SettingsView";

export function SettingsScreen() {
  const [state, setState] = useState<{
    loading: boolean;
    settings?: UserSettings;
    error?: unknown;
  }>({ loading: true });

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const settings = await getUserSettings();
        if (!active) return;
        setState({ loading: false, settings });
      } catch (caught) {
        if (!active) return;
        setState({ loading: false, error: caught });
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (state.loading) {
    return <LoadingState label="Loading settings…" />;
  }

  if (state.error !== undefined) {
    return <SettingsView error={state.error} />;
  }

  if (state.settings === undefined) {
    return <SettingsView error={new Error("Missing settings data")} />;
  }

  return <SettingsView settings={state.settings} />;
}
