"use client";

import { useEffect, useState } from "react";
import type { WorkflowRunSummary } from "@/types/workflow";
import { LoadingState } from "@/components/ui/LoadingState";
import { getWorkflowRuns } from "./api/get-workflow-runs";
import { WorkflowRunsView } from "./WorkflowRunsView";

export function WorkflowRunsScreen() {
  const [state, setState] = useState<{
    loading: boolean;
    runs?: WorkflowRunSummary[];
    error?: unknown;
  }>({ loading: true });

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const runs = await getWorkflowRuns();
        if (!active) return;
        setState({ loading: false, runs });
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
    return <LoadingState label="Loading workflow runs…" />;
  }

  if (state.error !== undefined) {
    return <WorkflowRunsView error={state.error} />;
  }

  if (state.runs === undefined) {
    return <WorkflowRunsView error={new Error("Missing workflow runs data")} />;
  }

  return <WorkflowRunsView runs={state.runs} />;
}
