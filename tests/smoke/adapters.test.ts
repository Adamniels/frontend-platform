import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchDashboardSummary } from "@/lib/api/adapters/dashboard";
import { fetchNewsFeed } from "@/lib/api/adapters/news";
import {
  createSideLearningSession,
  deleteSideLearningSession,
  fetchSideLearningSessions,
  fetchSideLearningSessionsByLifecycle,
  getSideLearningSession,
  refreshSideLearningTopicProposals,
  selectSideLearningTopic,
  submitSideLearningReflection,
  updateSideLearningProgress,
} from "@/lib/api/adapters/side-learning";
import { fetchWorkflowRuns } from "@/lib/api/adapters/workflow-runs";
import { fetchSavedItems } from "@/lib/api/adapters/saved-items";
import { fetchUserSettings } from "@/lib/api/adapters/settings";
import { fetchUserProfile } from "@/lib/api/adapters/profile";
import { fetchStats } from "@/lib/api/adapters/stats";
import { fetchInsights } from "@/lib/api/adapters/insights";
import { fetchInputNeededItems } from "@/lib/api/adapters/input-needed";

describe("backend adapters", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:5120";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL, init?: RequestInit) => {
        const url = String(input);
        const path = new URL(url).pathname;
        const method = (init?.method ?? "GET").toUpperCase();

        if (method === "POST" && path === "/api/v1/side-learning/sessions") {
          return new Response(
            JSON.stringify({
              sessionId: "sl-new",
              phase: "proposingTopics",
              workflowRunId: "wr-side",
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }

        if (method === "DELETE" && /^\/api\/v1\/side-learning\/sessions\/[^/]+$/.test(path)) {
          return new Response(null, { status: 204 });
        }

        if (method === "GET" && /^\/api\/v1\/side-learning\/sessions\/[^/]+$/.test(path)) {
          return new Response(
            JSON.stringify({
              id: path.split("/").pop(),
              phase: "awaitingTopicSelection",
              initialPrompt: "hint",
              selectedTopicTitle: null,
              selectedTopicReason: null,
              topicProposalsJson: JSON.stringify([{ title: "T1", rationale: "", estimatedMinutes: 10, difficulty: "easy", targetSkillGap: "" }]),
              sessionContentJson: "{}",
              sectionsProgressJson: "{}",
              reflectionText: null,
              workflowRunId: "wr1",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }

        if (
          method === "POST" &&
          path.startsWith("/api/v1/side-learning/sessions/") &&
          (path.endsWith("/select-topic") ||
            path.endsWith("/refresh-topic-proposals") ||
            path.endsWith("/progress") ||
            path.endsWith("/reflect"))
        ) {
          return new Response("{}", { status: 200, headers: { "content-type": "application/json" } });
        }

        if (method === "GET" && path === "/api/v1/side-learning/sessions") {
          const lifecycle = new URL(url).searchParams.get("lifecycle");
          const ts = new Date().toISOString();
          if (lifecycle === "ongoing") {
            return new Response(
              JSON.stringify({
                items: [
                  {
                    id: "sl-on",
                    phase: "awaitingTopicSelection",
                    selectedTopicTitle: null,
                    createdAt: ts,
                    updatedAt: ts,
                  },
                ],
              }),
              { status: 200, headers: { "content-type": "application/json" } },
            );
          }
          if (lifecycle === "archive") {
            return new Response(
              JSON.stringify({
                items: [
                  {
                    id: "sl-1",
                    phase: "completed",
                    selectedTopicTitle: "Temporal workflows",
                    createdAt: ts,
                    updatedAt: ts,
                  },
                ],
              }),
              { status: 200, headers: { "content-type": "application/json" } },
            );
          }
          return new Response(JSON.stringify({ error: "lifecycle query is required" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const payloadByPath: Record<string, unknown> = {
          "/api/v1/dashboard/summary": {
            greeting: "Welcome back",
            activeRuns: 2,
            itemsNeedingAttention: 1,
            savedItems: 43,
          },
          "/api/v1/news/feed": [{ id: "n1", title: "headline", source: "Wire", publishedAt: new Date().toISOString() }],
          "/api/v1/workflow-runs": [{ id: "wr1", name: "Run", status: "running", updatedAt: new Date().toISOString() }],
          "/api/v1/saved-items": [{ id: "sv1", title: "Saved", kind: "article", savedAt: new Date().toISOString() }],
          "/api/v1/settings": { theme: "system", digestEmail: true },
          "/api/v1/profile": { displayName: "You", email: "you@example.com" },
          "/api/v1/stats": { tiles: [{ label: "x", value: 1, unit: "", color: "c", sub: "s" }], progress: [], activity: [] },
          "/api/v1/memory/insights": [{ id: 1, label: "L", content: "C", strength: 50, confirmed: true }],
          "/api/v1/human-input/items": [{ id: 1, text: "T", type: "Rating", urgent: true, detail: "D" }],
        };
        const payload = payloadByPath[path];
        if (payload === undefined) {
          return new Response("not found", { status: 404 });
        }
        return new Response(JSON.stringify(payload), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns dashboard summary", async () => {
    const s = await fetchDashboardSummary();
    expect(typeof s.greeting).toBe("string");
    expect(typeof s.activeRuns).toBe("number");
    expect(typeof s.itemsNeedingAttention).toBe("number");
    expect(s.savedItems).toBe(43);
  });

  it("returns news items", async () => {
    const items = await fetchNewsFeed();
    expect(Array.isArray(items)).toBe(true);
    expect(typeof items[0]?.title).toBe("string");
  });

  it("returns side learning sessions", async () => {
    const sessions = await fetchSideLearningSessions();
    expect(sessions.length).toBeGreaterThan(0);
    expect(typeof sessions[0]?.phase).toBe("string");
  });

  it("returns side learning sessions by lifecycle (archive)", async () => {
    const page = await fetchSideLearningSessionsByLifecycle("archive");
    expect(page.items.length).toBeGreaterThan(0);
    expect(typeof page.items[0]?.phase).toBe("string");
    expect(page.items[0]?.selectedTopicTitle).toBe("Temporal workflows");
  });

  it("creates a side learning session", async () => {
    const res = await createSideLearningSession({ initialPrompt: "Learn X" });
    expect(res.sessionId).toBe("sl-new");
    expect(res.phase).toBe("proposingTopics");
  });

  it("fetches a side learning session by id", async () => {
    const d = await getSideLearningSession("sl-abc");
    expect(d.id).toBe("sl-abc");
    expect(d.phase).toBe("awaitingTopicSelection");
  });

  it("deletes a side learning session", async () => {
    await expect(deleteSideLearningSession("sl-abc")).resolves.toBeUndefined();
  });

  it("posts side learning mutations", async () => {
    await selectSideLearningTopic("sl-abc", { topicTitle: "T1", feedback: "more" });
    await refreshSideLearningTopicProposals("sl-abc", { feedback: "retry" });
    await updateSideLearningProgress("sl-abc", { sectionId: "goal", completed: true });
    await submitSideLearningReflection("sl-abc", { reflection: "great" });
  });

  it("returns workflow runs", async () => {
    const runs = await fetchWorkflowRuns();
    expect(runs.every((r) => typeof r.status === "string")).toBe(true);
  });

  it("returns saved items", async () => {
    const saved = await fetchSavedItems();
    expect(saved[0]?.kind).toBeDefined();
  });

  it("returns settings", async () => {
    const settings = await fetchUserSettings();
    expect(settings.theme).toBeDefined();
  });

  it("returns profile", async () => {
    const profile = await fetchUserProfile();
    expect(profile.email).toContain("@");
  });

  it("returns stats payload", async () => {
    const s = await fetchStats();
    expect(s.tiles.length).toBeGreaterThan(0);
  });

  it("returns insights", async () => {
    const list = await fetchInsights();
    expect(list[0]?.label).toBeDefined();
  });

  it("returns input needed items", async () => {
    const list = await fetchInputNeededItems();
    expect(list.length).toBeGreaterThan(0);
  });
});
