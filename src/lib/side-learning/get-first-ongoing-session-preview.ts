import { fetchSideLearningSessionsByLifecycle, getSideLearningSession } from "@/lib/api/adapters/side-learning";
import { parseSectionsProgress, parseSessionSections } from "@/modules/side-learning/side-learning-parse";

export type OngoingSessionPreview = {
  sessionId: string;
  title: string;
  progressPct: number;
  estimatedMinutesRemaining: number;
  phase: string;
};

/**
 * First ongoing side-learning session with progress derived from session detail.
 * Used by Dashboard and Start; failures yield null (caller shows empty state).
 */
export async function getFirstOngoingSessionPreview(
  cache: { next?: { revalidate?: number } } = { next: { revalidate: 30 } },
): Promise<OngoingSessionPreview | null> {
  const page = await fetchSideLearningSessionsByLifecycle("ongoing", cache).catch(() => ({ items: [] as const }));
  const first = page.items[0];
  if (!first) return null;

  const detail = await getSideLearningSession(first.id).catch(() => null);
  const title =
    detail?.selectedTopicTitle?.trim() ||
    first.selectedTopicTitle?.trim() ||
    "Learning session";

  if (!detail) {
    return {
      sessionId: first.id,
      title,
      progressPct: 0,
      estimatedMinutesRemaining: 0,
      phase: first.phase,
    };
  }

  const sections = parseSessionSections(detail.sessionContentJson);
  const prog = parseSectionsProgress(detail.sectionsProgressJson);
  const total = Math.max(sections.length, 1);
  const done = sections.filter((s) => prog[s.id]).length;
  const progressPct = Math.round((done / total) * 100);

  let estimatedMinutesRemaining = 0;
  for (const s of sections) {
    if (!prog[s.id]) estimatedMinutesRemaining += s.estimatedMinutes || 0;
  }

  return {
    sessionId: first.id,
    title,
    progressPct,
    estimatedMinutesRemaining,
    phase: detail.phase,
  };
}
