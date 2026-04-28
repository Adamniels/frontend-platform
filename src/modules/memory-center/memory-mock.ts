/**
 * Mock data for Memory Center and app-wide features that don't yet have backend support.
 *
 * Live exports (still used by production code):
 *  - MOCK_RELATIONSHIPS  → MemoryGraphPanel (no /api/v1/memory/relationships endpoint yet)
 *  - MOCK_NOTIFICATIONS  → AppShell (no /api/v1/notifications endpoint yet)
 *
 * Dormant exports (types/data kept for reference; no longer used in production code paths):
 *  - MOCK_SEMANTICS, MOCK_EVENTS, MOCK_RULES, MOCK_PROFILE_FACTS, MOCK_REVIEW_QUEUE
 *    These were previously used as silent fallbacks — that pattern has been removed.
 *    Delete these exports once you are confident the backend data is stable.
 *
 * All IDs match the semantic ID space from the real backend.
 * When the backend exposes an endpoint, delete the corresponding export and wire the adapter.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type MockSemanticMemory = {
  id: number;
  key: string;
  claim: string;
  domain: string;
  confidence: number;
  authorityWeight: number;
  status: string;
  createdAt: string;
  lastSupportedAt: string;
  evidenceCount: number;
};

export type MockMemoryEvent = {
  id: number;
  eventType: string;
  domain: string;
  workflowId: string | null;
  projectId: string | null;
  occurredAt: string;
  payload: Record<string, unknown>;
};

export type MockProceduralRule = {
  id: number;
  workflowType: string;
  ruleName: string;
  ruleContent: string;
  priority: number;
  source: string;
  authorityWeight: number;
  version: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type MockProfileFact = {
  id: number;
  key: string;
  value: string;
  confidence: number;
  status: string;
};

export type MockRelationship = {
  id: number;
  sourceId: number;
  targetId: number;
  type: string;
  label: string;
};

export type MockReviewItem = {
  id: number;
  proposalType: string;
  status: string;
  domain?: string;
  createdAt: string;
  reason: string;
  // NewSemantic
  key?: string;
  claim?: string;
  confidence?: number;
  authorityWeight?: number;
  // AdjustConfidence
  targetId?: number;
  targetKey?: string;
  currentConfidence?: number;
  proposedConfidence?: number;
  // MergeDuplicate
  mergeTargets?: string[];
  // NewProceduralRule
  ruleName?: string;
  workflowType?: string;
  ruleContent?: string;
};

// ── Data ─────────────────────────────────────────────────────────────────────

export const MOCK_SEMANTICS: MockSemanticMemory[] = [
  { id: 1, key: "preferred_learning_style", claim: "Prefers hands-on coding exercises over theory-heavy content", domain: "learning", confidence: 0.92, authorityWeight: 0.85, status: "Active", createdAt: "2026-03-15T10:00:00Z", lastSupportedAt: "2026-04-20T14:30:00Z", evidenceCount: 8 },
  { id: 2, key: "primary_language", claim: "Primarily works in TypeScript and C#", domain: "workflow", confidence: 0.97, authorityWeight: 0.95, status: "Active", createdAt: "2026-02-10T08:00:00Z", lastSupportedAt: "2026-04-25T09:00:00Z", evidenceCount: 15 },
  { id: 3, key: "works_on_platform_project", claim: "Currently building an AI-powered personal platform product", domain: "workflow", confidence: 0.99, authorityWeight: 1.0, status: "Active", createdAt: "2026-01-05T09:00:00Z", lastSupportedAt: "2026-04-27T08:00:00Z", evidenceCount: 42 },
  { id: 4, key: "interested_in_ai_agents", claim: "Has strong interest in AI agents, memory systems and autonomous workflows", domain: "learning", confidence: 0.95, authorityWeight: 0.9, status: "Active", createdAt: "2026-02-20T11:00:00Z", lastSupportedAt: "2026-04-22T16:00:00Z", evidenceCount: 21 },
  { id: 5, key: "uses_neovim", claim: "Actively uses Neovim as primary editor with custom config", domain: "workflow", confidence: 0.88, authorityWeight: 0.85, status: "Active", createdAt: "2026-03-01T10:00:00Z", lastSupportedAt: "2026-04-18T11:00:00Z", evidenceCount: 6 },
  { id: 6, key: "learning_rust", claim: "Currently learning Rust — completed AOC 2025 exercises in full", domain: "learning", confidence: 0.91, authorityWeight: 0.85, status: "Active", createdAt: "2026-03-10T09:00:00Z", lastSupportedAt: "2026-04-15T10:00:00Z", evidenceCount: 9 },
  { id: 7, key: "news_topics", claim: "Interested in AI, systems programming, and distributed systems news", domain: "recommendation", confidence: 0.83, authorityWeight: 0.75, status: "Active", createdAt: "2026-02-15T12:00:00Z", lastSupportedAt: "2026-04-24T08:00:00Z", evidenceCount: 12 },
  { id: 8, key: "communication_style", claim: "Prefers concise, technically accurate responses with inline code examples", domain: "profile", confidence: 0.89, authorityWeight: 0.9, status: "Active", createdAt: "2026-02-05T10:00:00Z", lastSupportedAt: "2026-04-10T14:00:00Z", evidenceCount: 18 },
  { id: 9, key: "work_hours_pattern", claim: "Most productive during morning hours (06:00–12:00 CET)", domain: "profile", confidence: 0.72, authorityWeight: 0.6, status: "PendingReview", createdAt: "2026-04-01T07:00:00Z", lastSupportedAt: "2026-04-20T07:30:00Z", evidenceCount: 4 },
  { id: 10, key: "prefers_clean_architecture", claim: "Strongly prefers Clean Architecture and domain-driven design patterns", domain: "workflow", confidence: 0.94, authorityWeight: 0.9, status: "Active", createdAt: "2026-02-20T10:00:00Z", lastSupportedAt: "2026-04-26T10:00:00Z", evidenceCount: 11 },
  { id: 11, key: "side_project_count", claim: "Typically runs 2–3 side projects concurrently", domain: "workflow", confidence: 0.78, authorityWeight: 0.7, status: "Active", createdAt: "2026-03-20T10:00:00Z", lastSupportedAt: "2026-04-05T10:00:00Z", evidenceCount: 3 },
  { id: 12, key: "learning_session_length", claim: "Prefers 20–40 minute focused learning sessions", domain: "learning", confidence: 0.86, authorityWeight: 0.8, status: "Active", createdAt: "2026-03-25T10:00:00Z", lastSupportedAt: "2026-04-12T10:00:00Z", evidenceCount: 7 },
];

export const MOCK_EVENTS: MockMemoryEvent[] = [
  { id: 1, eventType: "learning_session_completed", domain: "Learning", workflowId: "wf-learn-001", projectId: null, occurredAt: "2026-04-27T08:15:00Z", payload: { topic: "Rust ownership model", duration: 35, score: 0.87 } },
  { id: 2, eventType: "workflow_run_completed", domain: "Workflow", workflowId: "wf-news-042", projectId: null, occurredAt: "2026-04-27T07:00:00Z", payload: { workflow: "Morning News Digest", items: 12 } },
  { id: 3, eventType: "memory_consolidated", domain: "Workflow", workflowId: null, projectId: null, occurredAt: "2026-04-26T23:00:00Z", payload: { consolidated: 4, created: 2, updated: 1 } },
  { id: 4, eventType: "insight_generated", domain: "Recommendation", workflowId: "wf-insight-011", projectId: null, occurredAt: "2026-04-26T18:30:00Z", payload: { insight: "New Rust pattern relevant to platform backend", score: 0.91 } },
  { id: 5, eventType: "profile_fact_updated", domain: "Profile", workflowId: null, projectId: null, occurredAt: "2026-04-26T15:00:00Z", payload: { key: "communication_style", change: "confidence reinforced +0.04" } },
  { id: 6, eventType: "saved_item_processed", domain: "Recommendation", workflowId: "wf-saved-007", projectId: null, occurredAt: "2026-04-26T12:00:00Z", payload: { title: "Building Memory Systems for AI Agents", url: "https://example.com" } },
  { id: 7, eventType: "learning_session_completed", domain: "Learning", workflowId: "wf-learn-098", projectId: null, occurredAt: "2026-04-25T09:00:00Z", payload: { topic: "C# channels and concurrency", duration: 28, score: 0.92 } },
  { id: 8, eventType: "workflow_run_completed", domain: "Workflow", workflowId: "wf-news-041", projectId: null, occurredAt: "2026-04-25T07:00:00Z", payload: { workflow: "Morning News Digest", items: 9 } },
  { id: 9, eventType: "semantic_memory_created", domain: "Workflow", workflowId: null, projectId: null, occurredAt: "2026-04-24T16:00:00Z", payload: { key: "prefers_clean_architecture", confidence: 0.94 } },
  { id: 10, eventType: "human_input_provided", domain: "Profile", workflowId: null, projectId: "platform", occurredAt: "2026-04-24T11:30:00Z", payload: { prompt: "Describe your ideal workflow setup", response_length: 340 } },
  { id: 11, eventType: "memory_review_completed", domain: "Workflow", workflowId: null, projectId: null, occurredAt: "2026-04-23T10:00:00Z", payload: { approved: 2, rejected: 1 } },
  { id: 12, eventType: "insight_generated", domain: "Recommendation", workflowId: "wf-insight-010", projectId: null, occurredAt: "2026-04-22T19:00:00Z", payload: { insight: "Distributed systems pattern matching use case", score: 0.76 } },
  { id: 13, eventType: "learning_session_completed", domain: "Learning", workflowId: "wf-learn-097", projectId: null, occurredAt: "2026-04-21T08:30:00Z", payload: { topic: "TypeScript advanced generics", duration: 40, score: 0.89 } },
  { id: 14, eventType: "workflow_run_failed", domain: "Workflow", workflowId: "wf-insights-009", projectId: null, occurredAt: "2026-04-20T14:00:00Z", payload: { error: "Rate limit exceeded", retried: true } },
  { id: 15, eventType: "profile_fact_updated", domain: "Profile", workflowId: null, projectId: null, occurredAt: "2026-04-18T10:00:00Z", payload: { key: "preferred_learning_style", change: "confidence reinforced +0.02" } },
  { id: 16, eventType: "memory_consolidated", domain: "Workflow", workflowId: null, projectId: null, occurredAt: "2026-04-17T23:00:00Z", payload: { consolidated: 7, created: 3, updated: 2 } },
  { id: 17, eventType: "saved_item_processed", domain: "Recommendation", workflowId: "wf-saved-006", projectId: null, occurredAt: "2026-04-16T14:00:00Z", payload: { title: "Tokio async runtime deep dive", url: "https://example.com" } },
  { id: 18, eventType: "semantic_memory_created", domain: "Learning", workflowId: null, projectId: null, occurredAt: "2026-04-15T10:00:00Z", payload: { key: "learning_rust", confidence: 0.88 } },
];

export const MOCK_RULES: MockProceduralRule[] = [
  { id: 1, workflowType: "news", ruleName: "tech-relevance-filter", ruleContent: "Filter news items to only include those relevant to TypeScript, C#, Rust, AI agents, and distributed systems. Deprioritise business/finance news unless directly relevant to the tech industry.", priority: 10, source: "user_feedback", authorityWeight: 0.9, version: 3, status: "Active", createdAt: "2026-02-01T09:00:00Z", updatedAt: "2026-04-10T10:00:00Z" },
  { id: 2, workflowType: "side-learning", ruleName: "exercise-first", ruleContent: "Always structure learning sessions with a practical coding exercise before theory. User retains information better through hands-on application first.", priority: 9, source: "learning_feedback", authorityWeight: 0.85, version: 2, status: "Active", createdAt: "2026-02-15T10:00:00Z", updatedAt: "2026-03-20T10:00:00Z" },
  { id: 3, workflowType: "workflow", ruleName: "code-examples-in-summary", ruleContent: "Include short code snippets in workflow run summaries when the workflow relates to a technical task. Prefer TypeScript or C# for examples.", priority: 7, source: "user_preference", authorityWeight: 0.8, version: 1, status: "Active", createdAt: "2026-03-01T10:00:00Z", updatedAt: "2026-03-01T10:00:00Z" },
  { id: 4, workflowType: "recommendation", ruleName: "rust-boost", ruleContent: "Boost relevance score by +0.15 for any content related to Rust programming, especially ownership model, async runtimes, and systems programming patterns.", priority: 8, source: "learning_session_pattern", authorityWeight: 0.75, version: 2, status: "Active", createdAt: "2026-03-10T09:00:00Z", updatedAt: "2026-04-05T10:00:00Z" },
  { id: 5, workflowType: "insights", ruleName: "off-hours-scheduling", ruleContent: "Schedule insight generation and memory consolidation runs between 22:00 and 06:00 CET to avoid interrupting productive work hours.", priority: 6, source: "system_inference", authorityWeight: 0.65, version: 1, status: "Active", createdAt: "2026-04-01T08:00:00Z", updatedAt: "2026-04-01T08:00:00Z" },
  { id: 6, workflowType: "side-learning", ruleName: "session-length-cap", ruleContent: "Cap learning session content at 40 minutes of material. Provide a summary and clear next steps if the natural session length would exceed this threshold.", priority: 5, source: "user_feedback", authorityWeight: 0.8, version: 1, status: "Inactive", createdAt: "2026-04-15T10:00:00Z", updatedAt: "2026-04-15T10:00:00Z" },
];

export const MOCK_PROFILE_FACTS: MockProfileFact[] = [
  { id: 1, key: "full_name", value: "Adam Niels", confidence: 1.0, status: "Active" },
  { id: 2, key: "role", value: "Software Engineer", confidence: 0.98, status: "Active" },
  { id: 3, key: "location", value: "Sweden (CET timezone)", confidence: 0.97, status: "Active" },
  { id: 4, key: "experience_years", value: "5+ years professional experience", confidence: 0.9, status: "Active" },
];

export const MOCK_RELATIONSHIPS: MockRelationship[] = [
  { id: 1, sourceId: 4, targetId: 6, type: "Learning", label: "drives learning of" },
  { id: 2, sourceId: 2, targetId: 3, type: "WorksOn", label: "used in" },
  { id: 3, sourceId: 6, targetId: 2, type: "AppliedTo", label: "applied alongside" },
  { id: 4, sourceId: 1, targetId: 12, type: "InterestedIn", label: "shapes" },
  { id: 5, sourceId: 10, targetId: 3, type: "AppliedTo", label: "applied in" },
  { id: 6, sourceId: 5, targetId: 3, type: "Uses", label: "used for" },
  { id: 7, sourceId: 7, targetId: 4, type: "InterestedIn", label: "informs" },
  { id: 8, sourceId: 8, targetId: 1, type: "AppliedTo", label: "guides" },
  { id: 9, sourceId: 4, targetId: 7, type: "InterestedIn", label: "influences" },
  { id: 10, sourceId: 11, targetId: 3, type: "WorksOn", label: "part of" },
  { id: 11, sourceId: 6, targetId: 4, type: "Learning", label: "reinforces" },
  { id: 12, sourceId: 12, targetId: 1, type: "AppliedTo", label: "applies to" },
];

export const MOCK_REVIEW_QUEUE: MockReviewItem[] = [
  { id: 1, proposalType: "NewSemantic", status: "Pending", key: "prefers_vim_keybindings", claim: "User prefers Vim keybindings in all editors and IDEs, not just Neovim", confidence: 0.78, authorityWeight: 0.7, domain: "workflow", createdAt: "2026-04-26T22:00:00Z", reason: "Inferred from neovim config commits and editor settings across multiple repos" },
  { id: 2, proposalType: "AdjustConfidence", status: "Pending", targetId: 6, targetKey: "learning_rust", currentConfidence: 0.91, proposedConfidence: 0.95, domain: "learning", createdAt: "2026-04-25T23:00:00Z", reason: "Multiple AOC25 Rust completions and recent Tokio async runtime exploration observed — confidence should increase" },
  { id: 3, proposalType: "MergeDuplicate", status: "Pending", key: "workflow_architecture_preferences", mergeTargets: ["prefers_clean_architecture", "code_style_preference"], domain: "workflow", createdAt: "2026-04-24T23:00:00Z", reason: "Two semantics overlap significantly in meaning; recommend merging into a single canonical entry with higher authority" },
  { id: 4, proposalType: "NewProceduralRule", status: "Pending", ruleName: "distributed-systems-boost", workflowType: "recommendation", ruleContent: "Boost relevance score by +0.10 for distributed systems and event-sourcing content, based on recent platform backend work and saved item patterns", authorityWeight: 0.72, createdAt: "2026-04-23T23:00:00Z", reason: "Pattern detected in saved items, reading history, and workflow topics over the last 3 weeks" },
];
