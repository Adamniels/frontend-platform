import { apiRequest } from "@/lib/api/client";

export type UserProfile = {
  displayName: string;
  email: string;
};

const readCache = { next: { revalidate: 30 } as const };

export async function fetchUserProfile(): Promise<UserProfile> {
  return apiRequest<UserProfile>("/api/v1/profile", readCache);
}
