import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardView } from "@/modules/dashboard";
import { NewsView } from "@/modules/news";
import { SideLearningView } from "@/modules/side-learning";
import { WorkflowRunsView } from "@/modules/workflow-runs";
import { SavedItemsView } from "@/modules/saved-items";
import { SettingsView } from "@/modules/settings";
import { ProfileView } from "@/modules/profile";

describe("route group: dashboard", () => {
  it("renders dashboard heading", () => {
    render(
      <DashboardView
        data={{ greeting: "Hello", activeRuns: 1, itemsNeedingAttention: 0 }}
      />,
    );
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
  });
});

describe("route group: content (news + side learning)", () => {
  it("renders news list", () => {
    render(
      <NewsView
        items={[
          {
            id: "1",
            title: "T",
            source: "S",
            publishedAt: new Date().toISOString(),
          },
        ]}
      />,
    );
    expect(screen.getByRole("heading", { name: "News" })).toBeInTheDocument();
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("renders side learning topics", () => {
    render(<SideLearningView topics={[{ id: "1", title: "Topic", progressPercent: 50 }]} />);
    expect(screen.getByRole("heading", { name: "Side learning" })).toBeInTheDocument();
    expect(screen.getByText("Topic")).toBeInTheDocument();
  });
});

describe("route group: workflows", () => {
  it("renders workflow runs", () => {
    render(
      <WorkflowRunsView
        runs={[
          {
            id: "1",
            name: "Run A",
            status: "running",
            updatedAt: new Date().toISOString(),
          },
        ]}
      />,
    );
    expect(screen.getByRole("heading", { name: "Workflow runs" })).toBeInTheDocument();
    expect(screen.getByText("Run A")).toBeInTheDocument();
  });
});

describe("route group: library (saved items)", () => {
  it("renders saved items", () => {
    render(
      <SavedItemsView
        items={[
          {
            id: "1",
            title: "Item",
            kind: "article",
            savedAt: new Date().toISOString(),
          },
        ]}
      />,
    );
    expect(screen.getByRole("heading", { name: "Saved items" })).toBeInTheDocument();
    expect(screen.getByText("Item")).toBeInTheDocument();
  });
});

describe("route group: account (settings + profile)", () => {
  it("renders settings", () => {
    render(<SettingsView settings={{ theme: "system", digestEmail: false }} />);
    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
  });

  it("renders profile", () => {
    render(<ProfileView profile={{ displayName: "Ada", email: "ada@example.com" }} />);
    expect(screen.getByRole("heading", { name: "Profile" })).toBeInTheDocument();
    expect(screen.getByText("Ada")).toBeInTheDocument();
  });
});
