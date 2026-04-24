import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StatsView } from "@/modules/stats/StatsView";
import { DashboardView } from "@/modules/dashboard/DashboardView";

afterEach(() => {
  cleanup();
});

describe("serialized load errors", () => {
  it("StatsView shows load error message", () => {
    render(<StatsView loadError="Network down" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Network down");
  });

  it("DashboardView shows load error message", () => {
    render(<DashboardView loadError="Unauthorized" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Unauthorized");
  });
});
