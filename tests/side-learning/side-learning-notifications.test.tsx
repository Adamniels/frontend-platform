import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GlobalToastStack } from "@/components/layout/AppShell";
import { NotificationProvider } from "@/components/layout/NotificationsContext";
import { SideLearningNotificationWatcher } from "@/components/layout/SideLearningNotificationWatcher";
import { SideLearningExperience } from "@/modules/side-learning/SideLearningExperience";
import type { SideLearningListLifecycle, SideLearningSessionListPage, SideLearningSessionSummary } from "@/types/content";

const navigationMocks = vi.hoisted(() => ({
  pathname: "/side-learning",
  search: "",
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationMocks.pathname,
  useSearchParams: () => new URLSearchParams(navigationMocks.search),
  useRouter: () => ({
    push: navigationMocks.push,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

const sideLearningMocks = vi.hoisted(() => ({
  fetchSideLearningSessionsByLifecycle: vi.fn<
    (lifecycle: SideLearningListLifecycle) => Promise<SideLearningSessionListPage>
  >(),
}));

vi.mock("@/lib/api/adapters/side-learning", () => ({
  fetchSideLearningSessionsByLifecycle: sideLearningMocks.fetchSideLearningSessionsByLifecycle,
  createSideLearningSession: vi.fn(),
  getSideLearningSession: vi.fn(),
  deleteSideLearningSession: vi.fn(),
  refreshSideLearningTopicProposals: vi.fn(),
  selectSideLearningTopic: vi.fn(),
  submitSideLearningReflection: vi.fn(),
  updateSideLearningProgress: vi.fn(),
}));

function session(phase: string): SideLearningSessionSummary {
  return {
    id: "session-1",
    phase,
    selectedTopicTitle: "Temporal Logic",
    createdAt: "2026-05-10T08:00:00Z",
    updatedAt: "2026-05-10T08:10:00Z",
  };
}

async function advancePoll() {
  await act(async () => {
    vi.advanceTimersByTime(5000);
    await Promise.resolve();
  });
}

async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
  });
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  sessionStorage.clear();
});

beforeEach(() => {
  vi.useFakeTimers();
  navigationMocks.pathname = "/side-learning";
  navigationMocks.search = "";
  sideLearningMocks.fetchSideLearningSessionsByLifecycle.mockReset();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe("Side-learning global notifications", () => {
  it("does not render the old inline memory banners on the side-learning page", () => {
    render(
      <NotificationProvider>
        <SideLearningExperience />
      </NotificationProvider>,
    );

    expect(screen.queryByText(/After you finish, Jarvis may propose updates worth reviewing/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Jarvis may propose memories for your review queue/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Jarvis may have added suggestions to your memory inbox/i)).not.toBeInTheDocument();
  });

  it("shows a route-aware generated-session toast with memory review while already on side-learning", async () => {
    let phase = "generatingSession";
    sideLearningMocks.fetchSideLearningSessionsByLifecycle.mockImplementation(async (lifecycle) => ({
      items: lifecycle === "ongoing" ? [session(phase)] : [],
    }));

    render(
      <NotificationProvider>
        <SideLearningNotificationWatcher />
        <GlobalToastStack />
      </NotificationProvider>,
    );

    await flushEffects();
    expect(sideLearningMocks.fetchSideLearningSessionsByLifecycle).toHaveBeenCalledTimes(2);
    phase = "sessionReady";
    await advancePoll();

    expect(screen.getByText("Session generated")).toBeInTheDocument();
    expect(screen.getByText(/Jarvis may have noticed something worth saving/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Review memory" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Open session" })).not.toBeInTheDocument();
    expect(screen.getAllByText("Session generated")).toHaveLength(1);
  });

  it("shows Open session and deep-links to the generated session from another page", async () => {
    navigationMocks.pathname = "/memory";
    let phase = "generatingSession";
    sideLearningMocks.fetchSideLearningSessionsByLifecycle.mockImplementation(async (lifecycle) => ({
      items: lifecycle === "ongoing" ? [session(phase)] : [],
    }));

    render(
      <NotificationProvider>
        <SideLearningNotificationWatcher />
        <GlobalToastStack />
      </NotificationProvider>,
    );

    await flushEffects();
    expect(sideLearningMocks.fetchSideLearningSessionsByLifecycle).toHaveBeenCalledTimes(2);
    phase = "inProgress";
    await advancePoll();

    expect(screen.getByText("Session ready")).toBeInTheDocument();
    const action = screen.getByRole("button", { name: "Open session" });
    expect(action).toBeInTheDocument();
    action.click();
    expect(navigationMocks.push).toHaveBeenCalledWith("/side-learning?sessionId=session-1");
  });

  it("asks for topic input only when topic choices become available off the side-learning page", async () => {
    navigationMocks.pathname = "/memory";
    let phase = "proposingTopics";
    sideLearningMocks.fetchSideLearningSessionsByLifecycle.mockImplementation(async (lifecycle) => ({
      items: lifecycle === "ongoing" ? [session(phase)] : [],
    }));

    render(
      <NotificationProvider>
        <SideLearningNotificationWatcher />
        <GlobalToastStack />
      </NotificationProvider>,
    );

    await flushEffects();
    phase = "awaitingTopicSelection";
    await advancePoll();

    expect(screen.getByText("Choose a learning topic")).toBeInTheDocument();
    expect(screen.getByText(/needs your input/i)).toBeInTheDocument();
    const action = screen.getByRole("button", { name: "Review topics" });
    expect(action).toBeInTheDocument();
    action.click();
    expect(navigationMocks.push).toHaveBeenCalledWith("/side-learning?sessionId=session-1");
  });

  it("does not ask for topic input while already on the side-learning page", async () => {
    let phase = "proposingTopics";
    sideLearningMocks.fetchSideLearningSessionsByLifecycle.mockImplementation(async (lifecycle) => ({
      items: lifecycle === "ongoing" ? [session(phase)] : [],
    }));

    render(
      <NotificationProvider>
        <SideLearningNotificationWatcher />
        <GlobalToastStack />
      </NotificationProvider>,
    );

    await flushEffects();
    phase = "awaitingTopicSelection";
    await advancePoll();

    expect(screen.queryByText("Choose a learning topic")).not.toBeInTheDocument();
  });

  it("shows a memory review toast after reflection analysis completes", async () => {
    let completed = false;
    sideLearningMocks.fetchSideLearningSessionsByLifecycle.mockImplementation(async (lifecycle) => {
      if (!completed) {
        return { items: lifecycle === "ongoing" ? [session("analyzingReflection")] : [] };
      }
      return { items: lifecycle === "archive" ? [session("completed")] : [] };
    });

    render(
      <NotificationProvider>
        <SideLearningNotificationWatcher />
        <GlobalToastStack />
      </NotificationProvider>,
    );

    await flushEffects();
    expect(sideLearningMocks.fetchSideLearningSessionsByLifecycle).toHaveBeenCalledTimes(2);
    completed = true;
    await advancePoll();

    expect(screen.getByText("Memory review ready")).toBeInTheDocument();
    expect(screen.getByText("Jarvis may have learned something new from your session.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Check memory review" })).toBeInTheDocument();
  });
});
