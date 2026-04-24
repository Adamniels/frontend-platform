import { formatLoadError } from "@/lib/utils/error-message";
import { getUserSettings } from "./api/get-settings";
import { SettingsView } from "./SettingsView";

export async function SettingsScreen() {
  const result = await getUserSettings()
    .then((settings) => ({ ok: true as const, settings }))
    .catch((error: unknown) => ({ ok: false as const, error }));
  if (!result.ok) {
    return <SettingsView loadError={formatLoadError(result.error)} />;
  }
  return <SettingsView settings={result.settings} />;
}
