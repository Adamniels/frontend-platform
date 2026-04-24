"use client";

import type { DashboardSummary } from "@/types/dashboard";
import { DashboardClient } from "./DashboardClient";

export type DashboardViewProps = { data: DashboardSummary } | { loadError: string };

export function DashboardView(props: DashboardViewProps) {
  if ("loadError" in props) {
    return <DashboardClient loadError={props.loadError} />;
  }
  return <DashboardClient summary={props.data} />;
}
