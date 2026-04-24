import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAsyncResource } from "@/lib/hooks/use-async-resource";

afterEach(() => {
  cleanup();
});

describe("useAsyncResource", () => {
  it("resolves to success", async () => {
    const load = vi.fn(async () => "ok");
    function Comp() {
      const state = useAsyncResource(load, "one");
      if (state.status === "loading") return <div>loading</div>;
      if (state.status === "error") return <div>error</div>;
      return <div>{state.data}</div>;
    }
    render(<Comp />);
    expect(screen.getByText("loading")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("ok")).toBeInTheDocument());
    expect(load).toHaveBeenCalled();
  });

  it("handles rejection", async () => {
    const load = vi.fn(async () => {
      throw new Error("boom");
    });
    function Comp() {
      const state = useAsyncResource(load, "two");
      if (state.status === "loading") return <div>loading</div>;
      if (state.status === "error") return <div>error</div>;
      return <div>ok</div>;
    }
    render(<Comp />);
    await waitFor(() => expect(screen.getByText("error")).toBeInTheDocument());
  });
});
