export const BRIGHTNESS_STORAGE_KEY = "platform_shell_brightness";

export function readStoredBrightness(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BRIGHTNESS_STORAGE_KEY);
    if (raw === null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function writeStoredBrightness(value: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BRIGHTNESS_STORAGE_KEY, String(value));
  } catch {
    /* ignore */
  }
}

/** Maps settings slider (20–100) to a gentle content brightness for the light workspace. */
export function applyBrightnessToDocument(percent: number): void {
  if (typeof document === "undefined") return;
  const v = Math.min(100, Math.max(20, percent));
  const t = (v - 20) / 80;
  const factor = 0.88 + t * 0.2;
  document.documentElement.style.setProperty("--shell-brightness", String(factor));
}
