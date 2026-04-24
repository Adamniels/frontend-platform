"use client";

import { useEffect, useState } from "react";
import { LoadingState } from "@/components/ui/LoadingState";
import { getInsights } from "./api/get-insights";
import { InsightsView } from "./InsightsView";

export function InsightsScreen() {
  const [state, setState] = useState<{
    loading: boolean;
    items?: Awaited<ReturnType<typeof getInsights>>;
    error?: unknown;
  }>({ loading: true });

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const items = await getInsights();
        if (!active) return;
        setState({ loading: false, items });
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
    return <LoadingState label="Loading insights…" />;
  }

  if (state.error !== undefined) {
    return <InsightsView error={state.error} />;
  }
  if (state.items === undefined) {
    return <InsightsView error={new Error("Missing insights")} />;
  }
  return <InsightsView items={state.items} />;
}
