"use client";

import { useEffect, useState } from "react";
import type { DashboardSummary } from "@/types/dashboard";
import { LoadingState } from "@/components/ui/LoadingState";
import { getDashboardSummary } from "./api/get-dashboard-summary";
import { DashboardView } from "./DashboardView";

export function DashboardScreen() {
  const [state, setState] = useState<{
    loading: boolean;
    data?: DashboardSummary;
    error?: unknown;
  }>({ loading: true });

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const data = await getDashboardSummary();
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
    return <LoadingState label="Loading dashboard…" />;
  }

  if (state.error !== undefined) {
    return <DashboardView error={state.error} />;
  }

  if (state.data === undefined) {
    return <DashboardView error={new Error("Missing dashboard data")} />;
  }

  return <DashboardView data={state.data} />;
}
