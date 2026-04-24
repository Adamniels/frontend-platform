import { formatLoadError } from "@/lib/utils/error-message";
import { getUserProfile } from "./api/get-profile";
import { ProfileView } from "./ProfileView";

export async function ProfileScreen() {
  const result = await getUserProfile()
    .then((profile) => ({ ok: true as const, profile }))
    .catch((error: unknown) => ({ ok: false as const, error }));
  if (!result.ok) {
    return <ProfileView loadError={formatLoadError(result.error)} />;
  }
  return <ProfileView profile={result.profile} />;
}
