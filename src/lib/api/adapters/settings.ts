import { apiRequest } from "@/lib/api/client";

export type UserSettings = {
  theme: "system" | "light" | "dark";
  digestEmail: boolean;
};

export async function fetchUserSettings(): Promise<UserSettings> {
  return apiRequest<UserSettings>("/api/v1/settings");
}
