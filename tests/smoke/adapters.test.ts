import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchDashboardSummary } from "@/lib/api/adapters/dashboard";
import { fetchNewsFeed } from "@/lib/api/adapters/news";
import { fetchSideLearningTopics } from "@/lib/api/adapters/side-learning";
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
      vi.fn(async (input: string | URL) => {
        const url = String(input);
        const path = new URL(url).pathname;
        const payloadByPath: Record<string, unknown> = {
          "/api/v1/dashboard/summary": { greeting: "Welcome back", activeRuns: 2, itemsNeedingAttention: 1 },
          "/api/v1/news/feed": [{ id: "n1", title: "headline", source: "Wire", publishedAt: new Date().toISOString() }],
          "/api/v1/side-learning/topics": [{ id: "s1", title: "Foundations", progressPercent: 40 }],
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
  });

  it("returns news items", async () => {
    const items = await fetchNewsFeed();
    expect(Array.isArray(items)).toBe(true);
    expect(typeof items[0]?.title).toBe("string");
  });

  it("returns side learning topics", async () => {
    const topics = await fetchSideLearningTopics();
    expect(topics.length).toBeGreaterThan(0);
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
