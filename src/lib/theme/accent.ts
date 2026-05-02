export const ACCENT_STORAGE_KEY = "platform_accent";
export const PLATFORM_LIGHT_ACCENT = "#00D4FF";

const PLATFORM_LIGHT_TOKENS = {
  "--accent": "#00d4ff",
  "--accent-hex": "#00d4ff",
  "--accent-mid": "#5de4ff",
  "--accent-dim": "rgba(0,212,255,0.18)",
  "--accent-hover": "rgba(0,212,255,0.08)",
  "--accent-active": "rgba(0,212,255,0.14)",
  "--accent-subtle": "rgba(0,212,255,0.05)",
  "--accent-track": "rgba(0,212,255,0.12)",
  "--accent-glow": "rgba(0,212,255,0.20)",
  "--accent-card": "rgba(0,212,255,0.04)",
  "--accent-scanline": "rgba(0,212,255,0.04)",
  "--accent-alt": "#e8a020",
  "--accent-alt-dim": "rgba(232,160,32,0.16)",
  "--accent-alt-glow": "rgba(232,160,32,0.22)",
  "--color-bg": "#080c10",
  "--color-sidebar": "#0b1018",
  "--color-card": "#0e1520",
  "--color-card-hover": "#111a26",
  "--color-surface": "#111c2a",
  "--color-surface-hover": "#162234",
  "--color-border": "rgba(0,212,255,0.08)",
  "--color-border-strong": "rgba(0,212,255,0.16)",
  "--color-shadow": "rgba(0,0,0,0.40)",
  "--color-shadow-md": "rgba(0,0,0,0.60)",
  "--color-text": "#cce8f0",
  "--color-text-muted": "#5a7a8a",
  "--color-text-dim": "#34505e",
  "--color-green": "#00ff88",
  "--color-purple": "#a855f7",
  "--color-danger": "#ff3b3b",
  "--color-warning": "#e8a020",
  "--glow-accent": "0 0 12px rgba(0,212,255,0.25), 0 0 40px rgba(0,212,255,0.08)",
  "--glow-accent-strong": "0 0 6px rgba(0,212,255,0.50), 0 0 20px rgba(0,212,255,0.20)",
  "--glow-amber": "0 0 12px rgba(232,160,32,0.25), 0 0 40px rgba(232,160,32,0.08)",
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

  root.style.setProperty("--accent", hex);
  root.style.setProperty("--accent-mid", PLATFORM_LIGHT_TOKENS["--accent-mid"]);
  root.style.setProperty("--accent-dim", PLATFORM_LIGHT_TOKENS["--accent-dim"]);
  root.style.setProperty("--accent-hover", PLATFORM_LIGHT_TOKENS["--accent-hover"]);
  root.style.setProperty("--accent-active", PLATFORM_LIGHT_TOKENS["--accent-active"]);
  root.style.setProperty("--accent-card", PLATFORM_LIGHT_TOKENS["--accent-card"]);
  root.style.setProperty("--accent-track", PLATFORM_LIGHT_TOKENS["--accent-track"]);
  root.style.setProperty("--accent-glow", PLATFORM_LIGHT_TOKENS["--accent-glow"]);
  root.style.setProperty("--accent-scanline", PLATFORM_LIGHT_TOKENS["--accent-scanline"]);
  root.style.setProperty("--accent-hex", hex);
}
