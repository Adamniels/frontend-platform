import type { UserSettings } from "@/lib/api/adapters/settings";
import { getUserSettings } from "./api/get-settings";
import { SettingsView } from "./SettingsView";

export async function SettingsScreen() {
  let settings: UserSettings | undefined;
  let error: unknown;

  try {
    settings = await getUserSettings();
  } catch (caught) {
    error = caught;
  }

  if (error !== undefined) {
    return <SettingsView error={error} />;
  }

  if (settings === undefined) {
    return <SettingsView error={new Error("Missing settings data")} />;
  }

  return <SettingsView settings={settings} />;
}
