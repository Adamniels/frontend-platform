import type { UserProfile } from "@/lib/api/adapters/profile";
import { getUserProfile } from "./api/get-profile";
import { ProfileView } from "./ProfileView";

export async function ProfileScreen() {
  let profile: UserProfile | undefined;
  let error: unknown;

  try {
    profile = await getUserProfile();
  } catch (caught) {
    error = caught;
  }

  if (error !== undefined) {
    return <ProfileView error={error} />;
  }

  if (profile === undefined) {
    return <ProfileView error={new Error("Missing profile data")} />;
  }

  return <ProfileView profile={profile} />;
}
