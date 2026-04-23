/**
 * Auth token access — replace with real session/cookie integration when backend ships.
 * Client components should use `useAccessToken` from `./use-access-token`.
 */

export type TokenReader = () => string | null | undefined;

let serverTokenReader: TokenReader | null = null;

/** Register how the server resolves the bearer token (e.g. from cookies). */
export function setServerTokenReader(reader: TokenReader | null): void {
  serverTokenReader = reader;
}

export function getServerAccessToken(): string | null | undefined {
  return serverTokenReader?.() ?? null;
}
