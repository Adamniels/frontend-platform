import { formatLoadError } from "@/lib/utils/error-message";
import { getWorkflowRuns } from "./api/get-workflow-runs";
import { WorkflowRunsView } from "./WorkflowRunsView";

export async function WorkflowRunsScreen() {
  const result = await getWorkflowRuns()
    .then((runs) => ({ ok: true as const, runs }))
    .catch((error: unknown) => ({ ok: false as const, error }));
  if (!result.ok) {
    return <WorkflowRunsView loadError={formatLoadError(result.error)} />;
  }
  return <WorkflowRunsView runs={result.runs} />;
}
