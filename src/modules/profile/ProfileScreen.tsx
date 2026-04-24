"use client";

import { useEffect, useState } from "react";
import type { UserProfile } from "@/lib/api/adapters/profile";
import { LoadingState } from "@/components/ui/LoadingState";
import { getUserProfile } from "./api/get-profile";
import { ProfileView } from "./ProfileView";

export function ProfileScreen() {
  const [state, setState] = useState<{
    loading: boolean;
    profile?: UserProfile;
    error?: unknown;
  }>({ loading: true });

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const profile = await getUserProfile();
        if (!active) return;
        setState({ loading: false, profile });
      } catch (caught) {
        if (!active) return;
        setState({ loading: false, error: caught });
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (state.loading) {
    return <LoadingState label="Loading profile…" />;
  }

  if (state.error !== undefined) {
    return <ProfileView error={state.error} />;
  }

  if (state.profile === undefined) {
    return <ProfileView error={new Error("Missing profile data")} />;
  }

  return <ProfileView profile={state.profile} />;
}
