import { apiRequest } from "@/lib/api/client";

export type UserSettings = {
  theme: "system" | "light" | "dark";
  digestEmail: boolean;
};

const readCache = { next: { revalidate: 30 } as const };

export async function fetchUserSettings(): Promise<UserSettings> {
  return apiRequest<UserSettings>("/api/v1/settings", readCache);
}
