import { apiRequest } from "@/lib/api/client";

export type NewsInteractionType = "read" | "save" | "dismiss";

export interface PostNewsInteractionBody {
  newsItemId: string;
  type: NewsInteractionType;
  dwellSeconds?: number;
}

/**
 * Record a user interaction with a news item.
 * Fire-and-forget safe — the endpoint returns 204 No Content on success.
 */
export async function postNewsInteraction(
  body: PostNewsInteractionBody,
): Promise<void> {
  await apiRequest<null>("/api/v1/news/interactions", {
    method: "POST",
    body,
    cache: "no-store",
  });
}
