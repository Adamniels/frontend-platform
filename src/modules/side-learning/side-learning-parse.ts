import type {
  SideLearningSessionSectionParsed,
  SideLearningTopicProposal,
} from "@/types/content";

/** Canonical section order from workers `EXPECTED_SECTION_IDS`. */
export const SIDE_LEARNING_SECTION_ORDER = ["goal", "context", "hands-on", "reflection"] as const;

export function parseTopicProposals(topicProposalsJson: string): SideLearningTopicProposal[] {
  try {
    const raw = JSON.parse(topicProposalsJson || "[]") as unknown;
    if (!Array.isArray(raw)) return [];
    return raw
      .map((row) => {
        if (!row || typeof row !== "object") return null;
        const o = row as Record<string, unknown>;
        const title = typeof o.title === "string" ? o.title : "";
        if (!title.trim()) return null;
        return {
          title: title.trim(),
          rationale: typeof o.rationale === "string" ? o.rationale : "",
          estimatedMinutes: typeof o.estimatedMinutes === "number" ? o.estimatedMinutes : 0,
          difficulty: typeof o.difficulty === "string" ? o.difficulty : "",
          targetSkillGap: typeof o.targetSkillGap === "string" ? o.targetSkillGap : "",
        } satisfies SideLearningTopicProposal;
      })
      .filter((x): x is SideLearningTopicProposal => x !== null);
  } catch {
    return [];
  }
}

function readSection(row: unknown): SideLearningSessionSectionParsed | null {
  if (!row || typeof row !== "object") return null;
  const o = row as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id : "";
  if (!id) return null;
  const promptsRaw = o.prompts;
  const prompts = Array.isArray(promptsRaw)
    ? promptsRaw.filter((p): p is string => typeof p === "string")
    : null;
  return {
    id,
    label: typeof o.label === "string" ? o.label : id,
    estimatedMinutes: typeof o.estimatedMinutes === "number" ? o.estimatedMinutes : 0,
    type: typeof o.type === "string" ? o.type : "",
    content: typeof o.content === "string" ? o.content : "",
    example: typeof o.example === "string" ? o.example : null,
    youtubeQuery: typeof o.youtubeQuery === "string" ? o.youtubeQuery : null,
    outputType: typeof o.outputType === "string" ? o.outputType : null,
    prompts: prompts && prompts.length > 0 ? prompts : null,
  };
}

export function parseSessionSections(sessionContentJson: string): SideLearningSessionSectionParsed[] {
  try {
    const root = JSON.parse(sessionContentJson || "{}") as unknown;
    if (!root || typeof root !== "object") return [];
    const sections = (root as Record<string, unknown>).sections;
    if (!Array.isArray(sections)) return [];
    const byId = new Map<string, SideLearningSessionSectionParsed>();
    for (const row of sections) {
      const s = readSection(row);
      if (s) byId.set(s.id, s);
    }
    const ordered: SideLearningSessionSectionParsed[] = [];
    for (const id of SIDE_LEARNING_SECTION_ORDER) {
      const s = byId.get(id);
      if (s) ordered.push(s);
    }
    const order = SIDE_LEARNING_SECTION_ORDER as readonly string[];
    for (const [id, s] of byId) {
      if (!order.includes(id)) ordered.push(s);
    }
    return ordered;
  } catch {
    return [];
  }
}

export function parseSectionsProgress(sectionsProgressJson: string): Record<string, boolean> {
  try {
    const root = JSON.parse(sectionsProgressJson || "{}") as unknown;
    if (!root || typeof root !== "object") return {};
    const out: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(root as Record<string, unknown>)) {
      out[k] = v === true;
    }
    return out;
  } catch {
    return {};
  }
}
