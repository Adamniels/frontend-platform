/** Horizontal timeline: time axis math and adaptive tick steps (shared by canvas draw + hit testing). */

export const MS_PER_HOUR = 3600000;
export const MS_PER_DAY = 86400000;

const TICK_STEPS_MS: readonly number[] = [
  60_000,
  2 * 60_000,
  5 * 60_000,
  10 * 60_000,
  15 * 60_000,
  30 * 60_000,
  MS_PER_HOUR,
  2 * MS_PER_HOUR,
  3 * MS_PER_HOUR,
  4 * MS_PER_HOUR,
  6 * MS_PER_HOUR,
  12 * MS_PER_HOUR,
  MS_PER_DAY,
  2 * MS_PER_DAY,
  3 * MS_PER_DAY,
  7 * MS_PER_DAY,
  14 * MS_PER_DAY,
  30 * MS_PER_DAY,
  60 * MS_PER_DAY,
  90 * MS_PER_DAY,
  180 * MS_PER_DAY,
  365 * MS_PER_DAY,
];

/** Target ~70px between major ticks; returns step in milliseconds. */
export function pickTickStep(visibleMs: number, plotWidthPx: number): number {
  const n = Math.max(2, plotWidthPx / 70);
  const raw = visibleMs / n;
  for (const s of TICK_STEPS_MS) {
    if (s >= raw * 0.72) return s;
  }
  return TICK_STEPS_MS[TICK_STEPS_MS.length - 1]!;
}

export function alignTickStart(visibleStart: number, step: number): number {
  return Math.floor(visibleStart / step) * step;
}

export function formatTickLabel(t: number, step: number): string {
  const d = new Date(t);
  if (step < MS_PER_DAY) {
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (step < 7 * MS_PER_DAY) {
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }
  if (step < 60 * MS_PER_DAY) {
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export function formatVisibleRangeLabel(startMs: number, endMs: number): string {
  const spanDays = (endMs - startMs) / MS_PER_DAY;
  const spanStr =
    spanDays >= 1
      ? `${spanDays < 10 ? spanDays.toFixed(1) : Math.round(spanDays)}d visible`
      : `${((endMs - startMs) / MS_PER_HOUR).toFixed(1)}h visible`;

  const optsShort: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  const a = new Date(startMs).toLocaleDateString(undefined, optsShort);
  const b = new Date(endMs).toLocaleDateString(undefined, optsShort);
  return `${a} — ${b} · ${spanStr}`;
}

/** Pixels per day from scale (same units as TimelineCanvas). */
export function eventHitRadiusPx(scale: number): number {
  return Math.max(18, Math.min(40, 16 + scale * 0.04));
}

export function eventMarkerRadius(isHighlighted: boolean, scale: number): number {
  const base = isHighlighted ? 12 : 9.5;
  const bump = Math.min(6, scale * 0.018);
  return base + bump;
}
