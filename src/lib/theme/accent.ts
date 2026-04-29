export const ACCENT_STORAGE_KEY = "platform_accent";
export const PLATFORM_LIGHT_ACCENT = "#4A70A9";

const PLATFORM_LIGHT_TOKENS = {
  "--accent": "#4A70A9",
  "--accent-mid": "#8FABD4",
  "--accent-dim": "rgba(74,112,169,0.16)",
  "--accent-hover": "rgba(74,112,169,0.08)",
  "--accent-active": "rgba(74,112,169,0.12)",
  "--accent-card": "rgba(74,112,169,0.05)",
  "--accent-track": "rgba(74,112,169,0.14)",
  "--accent-glow": "rgba(74,112,169,0.15)",
  "--accent-scanline": "rgba(74,112,169,0.05)",
  "--accent-hex": "#4A70A9",
  "--color-bg": "#efece3",
  "--color-sidebar": "#e7e3d9",
  "--color-card": "#f7f5ef",
  "--color-card-hover": "#faf8f3",
  "--color-surface": "#e2dfd5",
  "--color-surface-hover": "#ece8de",
  "--color-border": "rgba(40,35,20,0.08)",
  "--color-border-strong": "rgba(40,35,20,0.14)",
  "--color-shadow": "rgba(30,25,10,0.06)",
  "--color-shadow-md": "rgba(30,25,10,0.10)",
  "--color-text": "#1c1a14",
  "--color-text-muted": "#7a7669",
  "--color-text-dim": "#a09c8e",
  "--color-green": "#1a9e72",
  "--color-danger": "#c94040",
  "--color-warning": "#b87200",
} as const;

export function readStoredAccent(): string | null {
  return PLATFORM_LIGHT_ACCENT;
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
  const root = document.documentElement;

  if (hex.trim().toUpperCase() === PLATFORM_LIGHT_ACCENT) {
    for (const [token, value] of Object.entries(PLATFORM_LIGHT_TOKENS)) {
      root.style.setProperty(token, value);
    }
    return;
  }

  root.style.setProperty("--accent", PLATFORM_LIGHT_ACCENT);
  root.style.setProperty("--accent-mid", PLATFORM_LIGHT_TOKENS["--accent-mid"]);
  root.style.setProperty("--accent-dim", PLATFORM_LIGHT_TOKENS["--accent-dim"]);
  root.style.setProperty("--accent-hover", PLATFORM_LIGHT_TOKENS["--accent-hover"]);
  root.style.setProperty("--accent-active", PLATFORM_LIGHT_TOKENS["--accent-active"]);
  root.style.setProperty("--accent-card", PLATFORM_LIGHT_TOKENS["--accent-card"]);
  root.style.setProperty("--accent-track", PLATFORM_LIGHT_TOKENS["--accent-track"]);
  root.style.setProperty("--accent-glow", PLATFORM_LIGHT_TOKENS["--accent-glow"]);
  root.style.setProperty("--accent-scanline", PLATFORM_LIGHT_TOKENS["--accent-scanline"]);
  root.style.setProperty("--accent-hex", PLATFORM_LIGHT_TOKENS["--accent-hex"]);
}
