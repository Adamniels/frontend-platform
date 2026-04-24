"use client";

import { useEffect, useState } from "react";
import { LoadingState } from "@/components/ui/LoadingState";
import { getInputNeededItems } from "./api/get-items";
import { InputNeededView } from "./InputNeededView";

export function InputNeededScreen() {
  const [state, setState] = useState<{
    loading: boolean;
    items?: Awaited<ReturnType<typeof getInputNeededItems>>;
    error?: unknown;
  }>({ loading: true });

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const items = await getInputNeededItems();
        if (!active) return;
        setState({ loading: false, items });
      } catch (caught) {
        if (!active) return;
        setState({ loading: false, error: caught });
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (state.loading) {
    return <LoadingState label="Loading input queue…" />;
  }

  if (state.error !== undefined) {
    return <InputNeededView error={state.error} />;
  }
  if (state.items === undefined) {
    return <InputNeededView error={new Error("Missing items")} />;
  }
  return <InputNeededView items={state.items} />;
}
