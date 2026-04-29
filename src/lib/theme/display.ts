export const SCANLINES_STORAGE_KEY = "platform_scanlines_enabled";
export const HEXGRID_STORAGE_KEY = "platform_hexgrid_enabled";

function readBool(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return raw === "1";
  } catch {
    return fallback;
  }
}

function writeBool(key: string, value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function readStoredScanlines(): boolean {
  return readBool(SCANLINES_STORAGE_KEY, false);
}

export function writeStoredScanlines(enabled: boolean): void {
  writeBool(SCANLINES_STORAGE_KEY, enabled);
}

export function readStoredHexGrid(): boolean {
  return readBool(HEXGRID_STORAGE_KEY, true);
}

export function writeStoredHexGrid(enabled: boolean): void {
  writeBool(HEXGRID_STORAGE_KEY, enabled);
}

export function applyScanlinesToDocument(enabled: boolean): void {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--scanlines-opacity", enabled ? "1" : "0");
}

export function applyHexGridToDocument(enabled: boolean): void {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--hexgrid-opacity", enabled ? "0.025" : "0");
}
