import type { SavedItemSummary } from "@/types/content";
import { delay } from "./delay";

export async function fetchSavedItems(): Promise<SavedItemSummary[]> {
  await delay(100);
  return [
    {
      id: "sv1",
      title: "Saved article (placeholder)",
      kind: "article",
      savedAt: new Date().toISOString(),
    },
  ];
}
