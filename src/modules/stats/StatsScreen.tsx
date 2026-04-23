import { getStats } from "./api/get-stats";
import { StatsView } from "./StatsView";

export async function StatsScreen() {
  let data: Awaited<ReturnType<typeof getStats>> | undefined;
  let error: unknown;

  try {
    data = await getStats();
  } catch (caught) {
    error = caught;
  }

  if (error !== undefined) {
    return <StatsView error={error} />;
  }
  if (data === undefined) {
    return <StatsView error={new Error("Missing stats")} />;
  }
  return <StatsView data={data} />;
}
