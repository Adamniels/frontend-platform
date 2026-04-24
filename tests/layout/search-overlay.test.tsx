import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SearchOverlay } from "@/components/layout/SearchOverlay";

afterEach(() => {
  cleanup();
});

describe("SearchOverlay", () => {
  it("exposes an accessible dialog name when open", () => {
    render(<SearchOverlay open onClose={() => {}} />);
    expect(screen.getByRole("dialog", { name: "Search platform" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /search query/i })).toBeInTheDocument();
  });

  it("calls onClose when Escape is pressed", async () => {
    const onClose = vi.fn();
    render(<SearchOverlay open onClose={onClose} />);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(onClose).toHaveBeenCalled();
  });
});
