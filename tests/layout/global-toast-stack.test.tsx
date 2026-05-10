import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GlobalToastStack } from "@/components/layout/AppShell";
import { NotificationProvider, useNotifications } from "@/components/layout/NotificationsContext";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

function ToastHarness() {
  const { push } = useNotifications();
  return (
    <button
      type="button"
      onClick={() =>
        push({
          title: "Session ready",
          message: "Your learning session is ready.",
          actionLabel: "Open learning",
          href: "/side-learning",
          durationMs: 1000,
        })}
    >
      Notify
    </button>
  );
}

afterEach(() => {
  cleanup();
  pushMock.mockReset();
});

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe("GlobalToastStack", () => {
  it("renders notifications, supports CTA clicks, and auto-dismisses", () => {
    render(
      <NotificationProvider>
        <GlobalToastStack />
        <ToastHarness />
      </NotificationProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Notify" }));

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Session ready")).toBeInTheDocument();
    expect(screen.getByText("Your learning session is ready.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open learning" }));
    expect(pushMock).toHaveBeenCalledWith("/side-learning");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Notify" }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
