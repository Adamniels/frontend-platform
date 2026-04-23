export const ACCENT_STORAGE_KEY = "platform_accent";

export function readStoredAccent(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACCENT_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeStoredAccent(hex: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACCENT_STORAGE_KEY, hex);
  } catch {
    /* ignore */
  }
}

export function applyAccentToDocument(hex: string): void {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--accent", hex);
}
