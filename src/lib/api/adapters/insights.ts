import { apiRequest } from "@/lib/api/client";

export type MemoryInsight = {
  id: number;
  label: string;
  content: string;
  strength: number;
  confirmed: boolean;
};

const readCache = { next: { revalidate: 30 } as const };

export async function fetchInsights(): Promise<MemoryInsight[]> {
  return apiRequest<MemoryInsight[]>("/api/v1/memory/insights", readCache);
}
