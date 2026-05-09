export const ACCENT_STORAGE_KEY = "platform_accent";
/** Default platform accent; matches preset bundle in `PLATFORM_LIGHT_TOKENS`. */
export const PLATFORM_LIGHT_ACCENT = "#0D9488";

const PLATFORM_LIGHT_TOKENS = {
  "--accent": "#0d9488",
  "--accent-hex": "#0d9488",
  "--accent-mid": "#14b8a6",
  "--accent-dim": "color-mix(in srgb, #0d9488 22%, transparent)",
  "--accent-hover": "color-mix(in srgb, #0d9488 10%, transparent)",
  "--accent-active": "color-mix(in srgb, #0d9488 16%, transparent)",
  "--accent-subtle": "color-mix(in srgb, #0d9488 6%, transparent)",
  "--accent-track": "color-mix(in srgb, #0d9488 14%, transparent)",
  "--accent-glow": "color-mix(in srgb, #0d9488 12%, transparent)",
  "--accent-card": "color-mix(in srgb, #0d9488 4%, transparent)",
  "--accent-scanline": "color-mix(in srgb, #0d9488 4%, transparent)",
  "--accent-alt": "#d97706",
  "--accent-alt-dim": "color-mix(in srgb, #d97706 18%, transparent)",
  "--accent-alt-glow": "color-mix(in srgb, #d97706 14%, transparent)",
  "--color-bg": "#eceef2",
  "--color-canvas": "#eceef2",
  "--color-sidebar": "#1e293b",
  "--color-sidebar-hover": "#334155",
  "--color-card": "#ffffff",
  "--color-card-hover": "#f8fafc",
  "--color-surface": "#f1f5f9",
  "--color-surface-hover": "#e2e8f0",
  "--color-border": "rgba(15, 23, 42, 0.08)",
  "--color-border-strong": "rgba(15, 23, 42, 0.12)",
  "--color-shadow": "rgba(15, 23, 42, 0.06)",
  "--color-shadow-md": "rgba(15, 23, 42, 0.1)",
  "--shadow-sm": "0 1px 2px rgba(15, 23, 42, 0.06)",
  "--shadow-md": "0 4px 12px rgba(15, 23, 42, 0.1)",
  "--color-text": "#0f172a",
  "--color-text-muted": "#64748b",
  "--color-text-dim": "#94a3b8",
  "--color-sidebar-text": "#f1f5f9",
  "--color-sidebar-text-muted": "rgba(241, 245, 249, 0.72)",
  "--color-sidebar-text-dim": "rgba(241, 245, 249, 0.48)",
  "--color-green": "#059669",
  "--color-purple": "#7c3aed",
  "--color-danger": "#dc2626",
  "--color-warning": "#d97706",
  "--glow-accent": "0 1px 2px rgba(15, 23, 42, 0.06)",
  "--glow-accent-strong": "0 4px 12px rgba(15, 23, 42, 0.1)",
  "--glow-amber": "0 1px 2px rgba(15, 23, 42, 0.06)",
} as const;

function normalizeStoredAccent(raw: string | null): string | null {
  if (raw === null || raw.trim() === "") return null;
  const t = raw.trim();
  /* Migrate legacy electric cyan to current platform preset. */
  if (t.toUpperCase() === "#00D4FF") return PLATFORM_LIGHT_ACCENT;
  return t;
}

export function readStoredAccent(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return normalizeStoredAccent(localStorage.getItem(ACCENT_STORAGE_KEY));
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
  const root = document.documentElement;
  const normalized = hex.trim().toUpperCase() === "#00D4FF" ? PLATFORM_LIGHT_ACCENT : hex.trim();

  if (normalized.toUpperCase() === PLATFORM_LIGHT_ACCENT.toUpperCase()) {
    for (const [token, value] of Object.entries(PLATFORM_LIGHT_TOKENS)) {
      root.style.setProperty(token, value);
    }
    return;
  }

  root.style.setProperty("--accent", normalized);
  root.style.setProperty("--accent-hex", normalized);
  root.style.setProperty("--accent-mid", PLATFORM_LIGHT_TOKENS["--accent-mid"]);
  root.style.setProperty("--accent-dim", PLATFORM_LIGHT_TOKENS["--accent-dim"]);
  root.style.setProperty("--accent-hover", PLATFORM_LIGHT_TOKENS["--accent-hover"]);
  root.style.setProperty("--accent-active", PLATFORM_LIGHT_TOKENS["--accent-active"]);
  root.style.setProperty("--accent-card", PLATFORM_LIGHT_TOKENS["--accent-card"]);
  root.style.setProperty("--accent-track", PLATFORM_LIGHT_TOKENS["--accent-track"]);
  root.style.setProperty("--accent-glow", PLATFORM_LIGHT_TOKENS["--accent-glow"]);
  root.style.setProperty("--accent-scanline", PLATFORM_LIGHT_TOKENS["--accent-scanline"]);
}
