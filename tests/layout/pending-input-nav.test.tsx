import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MainNav } from "@/components/layout/MainNav";
import { PendingInputProvider } from "@/components/layout/PendingInputContext";
import { InputNeededView } from "@/modules/input-needed/InputNeededView";

afterEach(() => {
  cleanup();
});

describe("Pending input badge", () => {
  it("syncs badge count from InputNeededView pending items", () => {
    render(
      <PendingInputProvider>
        <MainNav onSearchClick={() => {}} />
        <InputNeededView
          items={[
            { id: 1, text: "A", type: "T", urgent: false, detail: "d" },
            { id: 2, text: "B", type: "T", urgent: false, detail: "d" },
          ]}
        />
      </PendingInputProvider>,
    );
    const link = screen.getByRole("link", { name: /input needed/i });
    expect(within(link).getByText("2")).toBeInTheDocument();
  });
});
