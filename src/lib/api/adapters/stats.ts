import { apiRequest } from "@/lib/api/client";

export type StatTile = {
  label: string;
  value: number;
  unit: string;
  color: string;
  sub: string;
};

export type StatProgress = { label: string; value: number; color: string };

export type StatActivity = { day: string; sessions: number };

export type StatsPayload = {
  tiles: StatTile[];
  progress: StatProgress[];
  activity: StatActivity[];
};

const readCache = { next: { revalidate: 30 } as const };

export async function fetchStats(): Promise<StatsPayload> {
  return apiRequest<StatsPayload>("/api/v1/stats", readCache);
}
