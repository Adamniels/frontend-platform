import type { InputNeededItem } from "@/lib/api/adapters/input-needed";
import type { OngoingSessionPreview } from "@/lib/side-learning/get-first-ongoing-session-preview";
import type { DashboardSummary } from "@/types/dashboard";
import { DashboardClient } from "./DashboardClient";

export type DashboardViewProps =
  | { loadError: string }
  | {
      data: DashboardSummary;
      inputNeededItems: InputNeededItem[];
      ongoingSession: OngoingSessionPreview | null;
      newsFeedCount: number | null;
    };

export function DashboardView(props: DashboardViewProps) {
  if ("loadError" in props) {
    return <DashboardClient loadError={props.loadError} />;
  }
  return (
    <DashboardClient
      summary={props.data}
      inputNeededItems={props.inputNeededItems}
      ongoingSession={props.ongoingSession}
      newsFeedCount={props.newsFeedCount}
    />
  );
}
