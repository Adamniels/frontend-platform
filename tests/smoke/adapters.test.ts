import { describe, expect, it } from "vitest";
import { fetchDashboardSummary } from "@/lib/api/adapters/dashboard";
import { fetchNewsFeed } from "@/lib/api/adapters/news";
import { fetchSideLearningTopics } from "@/lib/api/adapters/side-learning";
import { fetchWorkflowRuns } from "@/lib/api/adapters/workflow-runs";
import { fetchSavedItems } from "@/lib/api/adapters/saved-items";
import { fetchUserSettings } from "@/lib/api/adapters/settings";
import { fetchUserProfile } from "@/lib/api/adapters/profile";

describe("placeholder adapters", () => {
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
});
