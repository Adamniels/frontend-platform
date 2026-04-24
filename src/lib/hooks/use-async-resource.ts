import { useEffect, useState } from "react";

export type AsyncResourceState<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: unknown };

/**
 * Cancellation-safe client fetch helper for interactive surfaces.
 * Prefer server data loading in route `*Screen` components when possible.
 *
 * @param depsKey - When this changes, the effect re-runs (e.g. refresh counter).
 * @param load - Should be stable (`useCallback`) if defined inline in a parent.
 */
export function useAsyncResource<T>(load: () => Promise<T>, depsKey: string): AsyncResourceState<T> {
  const [state, setState] = useState<AsyncResourceState<T>>({ status: "loading" });

  useEffect(() => {
    let active = true;
    void load()
      .then((data) => {
        if (active) setState({ status: "success", data });
      })
      .catch((error: unknown) => {
        if (active) setState({ status: "error", error });
      });
    return () => {
      active = false;
    };
  }, [depsKey, load]);

  return state;
}
