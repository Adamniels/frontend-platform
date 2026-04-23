"use client";

import { useMemo } from "react";

/**
 * Placeholder: returns null until auth is wired. UI can branch on presence of token.
 */
export function useAccessToken(): string | null {
  return useMemo(() => null, []);
}
