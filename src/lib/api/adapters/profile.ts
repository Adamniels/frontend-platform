import { apiRequest } from "@/lib/api/client";

export type UserProfile = {
  displayName: string;
  email: string;
};

export async function fetchUserProfile(): Promise<UserProfile> {
  return apiRequest<UserProfile>("/api/v1/profile");
}
