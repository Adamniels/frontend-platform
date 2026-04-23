import type { ReactElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach } from "vitest";
import { describe, expect, it } from "vitest";
import { PendingInputProvider } from "@/components/layout/PendingInputContext";
import { DashboardView } from "@/modules/dashboard";
import { NewsView } from "@/modules/news";
import { SideLearningView } from "@/modules/side-learning";
import { WorkflowRunsView } from "@/modules/workflow-runs";
import { SavedItemsView } from "@/modules/saved-items";
import { SettingsView } from "@/modules/settings";
import { ProfileView } from "@/modules/profile";
import { StatsView } from "@/modules/stats";
import { InsightsView } from "@/modules/insights";
import { InputNeededView } from "@/modules/input-needed";
import type { StatsPayload } from "@/lib/api/adapters/stats";
import type { MemoryInsight } from "@/lib/api/adapters/insights";
import type { InputNeededItem } from "@/lib/api/adapters/input-needed";

function withShell(node: ReactElement) {
  return render(<PendingInputProvider>{node}</PendingInputProvider>);
}

afterEach(() => {
  cleanup();
});

describe("route group: dashboard", () => {
  it("renders dashboard hero", () => {
    render(
      <DashboardView
        data={{ greeting: "Hello", activeRuns: 1, itemsNeedingAttention: 0 }}
      />,
    );
    expect(screen.getByText(/let's continue/i)).toBeInTheDocument();
    expect(screen.getByText(/building/i)).toBeInTheDocument();
  });
});

describe("route group: content (news + side learning)", () => {
  it("renders news feed chrome", () => {
    render(<NewsView />);
    expect(screen.getByRole("heading", { name: /personalized feed/i })).toBeInTheDocument();
  });

  it("renders side learning topics", () => {
    render(<SideLearningView />);
    expect(screen.getByRole("heading", { name: /learning topics/i })).toBeInTheDocument();
    expect(screen.getByText(/AI Ethics in Practice/i)).toBeInTheDocument();
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
    expect(screen.getByText("Run A")).toBeInTheDocument();
    expect(screen.getByText("Running")).toBeInTheDocument();
  });
});

describe("route group: library (saved items)", () => {
  it("renders saved library", () => {
    render(<SavedItemsView />);
    expect(screen.getByRole("heading", { name: /saved library/i })).toBeInTheDocument();
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

describe("route group: stats", () => {
  it("renders stats tiles", () => {
    const data: StatsPayload = {
      tiles: [
        { label: "X", value: 1, unit: "", color: "var(--accent)", sub: "s" },
      ],
      progress: [],
      activity: [],
    };
    render(<StatsView data={data} />);
    expect(screen.getByRole("heading", { name: "Stats" })).toBeInTheDocument();
  });
});

describe("route group: insights", () => {
  it("renders insights list", () => {
    const items: MemoryInsight[] = [
      { id: 1, label: "L", content: "C", strength: 50, confirmed: true },
    ];
    render(<InsightsView items={items} />);
    expect(screen.getByRole("heading", { name: /what we know/i })).toBeInTheDocument();
  });
});

describe("route group: input needed", () => {
  it("renders input queue", () => {
    const items: InputNeededItem[] = [
      { id: 1, text: "Do thing", type: "Rating", urgent: true, detail: "Details here." },
    ];
    withShell(<InputNeededView items={items} />);
    expect(screen.getByRole("heading", { name: /input needed/i })).toBeInTheDocument();
    expect(screen.getByText("Do thing")).toBeInTheDocument();
  });
});
