import { apiRequest } from "@/lib/api/client";

export type InputNeededItem = {
  id: number;
  text: string;
  type: string;
  urgent: boolean;
  detail: string;
};

const readCache = { next: { revalidate: 30 } as const };

export async function fetchInputNeededItems(): Promise<InputNeededItem[]> {
  return apiRequest<InputNeededItem[]>("/api/v1/human-input/items", readCache);
}
