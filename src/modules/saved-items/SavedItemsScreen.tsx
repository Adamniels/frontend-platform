import { formatLoadError } from "@/lib/utils/error-message";
import { getSavedItems } from "./api/get-saved-items";
import { SavedItemsView } from "./SavedItemsView";

export async function SavedItemsScreen() {
  const result = await getSavedItems()
    .then((items) => ({ ok: true as const, items }))
    .catch((error: unknown) => ({ ok: false as const, error }));
  if (!result.ok) {
    return <SavedItemsView loadError={formatLoadError(result.error)} />;
  }
  return <SavedItemsView items={result.items} />;
}
