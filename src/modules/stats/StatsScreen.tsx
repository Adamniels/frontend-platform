"use client";

import { useEffect, useState } from "react";
import { LoadingState } from "@/components/ui/LoadingState";
import { getStats } from "./api/get-stats";
import { StatsView } from "./StatsView";

export function StatsScreen() {
  const [state, setState] = useState<{
    loading: boolean;
    data?: Awaited<ReturnType<typeof getStats>>;
    error?: unknown;
  }>({ loading: true });

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const data = await getStats();
        if (!active) return;
        setState({ loading: false, data });
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
    return <LoadingState label="Loading stats…" />;
  }

  if (state.error !== undefined) {
    return <StatsView error={state.error} />;
  }
  if (state.data === undefined) {
    return <StatsView error={new Error("Missing stats")} />;
  }
  return <StatsView data={state.data} />;
}
