// SSR-safe reduced-motion check. Must be called at the top of every anime.js effect.
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
