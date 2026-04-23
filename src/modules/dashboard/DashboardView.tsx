"use client";

import type { DashboardSummary } from "@/types/dashboard";
import { DashboardClient } from "./DashboardClient";

type DashboardViewProps = { data: DashboardSummary } | { error: unknown };

export function DashboardView(props: DashboardViewProps) {
  if ("error" in props) {
    return <DashboardClient error={props.error} />;
  }
  return <DashboardClient summary={props.data} />;
}
