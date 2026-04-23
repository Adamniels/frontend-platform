import type { SavedItemSummary } from "@/types/content";
import { getSavedItems } from "./api/get-saved-items";
import { SavedItemsView } from "./SavedItemsView";

export async function SavedItemsScreen() {
  let items: SavedItemSummary[] | undefined;
  let error: unknown;

  try {
    items = await getSavedItems();
  } catch (caught) {
    error = caught;
  }

  if (error !== undefined) {
    return <SavedItemsView error={error} />;
  }

  if (items === undefined) {
    return <SavedItemsView error={new Error("Missing saved items data")} />;
  }

  return <SavedItemsView items={items} />;
}
