import { delay } from "./delay";

export type UserProfile = {
  displayName: string;
  email: string;
};

export async function fetchUserProfile(): Promise<UserProfile> {
  await delay(80);
  return {
    displayName: "You",
    email: "you@example.com",
  };
}
