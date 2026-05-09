"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import { formatLoadError } from "@/lib/utils/error-message";
import { useAsyncResource } from "@/lib/hooks/use-async-resource";
import { CURRENT_USER_ID, fetchMemoryEvents, type MemoryEventV1 } from "@/lib/api/adapters/memory-center";
import styles from "./memory-center.module.css";
import {
  MS_PER_DAY,
  alignTickStart,
  eventHitRadiusPx,
  eventMarkerRadius,
  formatTickLabel,
  formatVisibleRangeLabel,
  pickTickStep,
} from "./timeline-canvas-helpers";

/** Room for longest lane label ("RECOMMENDATION") right-aligned in monospace. */
const LEFT_GUTTER = 142;
const TOP_PAD = 18;
const RULER_H = 50;

/** Lane centers as fraction of inner height — tight 12% spacing, vertically centered. */
const DOMAIN_LANES = {
  Learning: { y: 0.3, color: "#6b8fc3", rgb: "107,143,195", label: "LEARNING" },
  Workflow: { y: 0.42, color: "#b58a49", rgb: "181,138,73", label: "WORKFLOW" },
  Recommendation: { y: 0.54, color: "#b68bbd", rgb: "182,139,189", label: "RECOMMENDATION" },
  Profile: { y: 0.66, color: "#79a88b", rgb: "121,168,139", label: "PROFILE" },
} as const;

type DomainKey = keyof typeof DOMAIN_LANES;

const EV_ICONS: Record<string, string> = {
  learning_session_completed: "◎",
  workflow_run_completed: "⚡",
  workflow_run_failed: "⚠",
  memory_consolidated: "◈",
  insight_generated: "◆",
  profile_fact_updated: "◉",
  saved_item_processed: "◇",
  semantic_memory_created: "⟡",
  human_input_provided: "✎",
};

type TlEvent = MemoryEventV1 & {
  payload?: Record<string, unknown>;
};

function laneKey(domain: string | null | undefined): DomainKey {
  const s = (domain ?? "").trim().toLowerCase();
  const hit = (Object.keys(DOMAIN_LANES) as DomainKey[]).find((k) => k.toLowerCase() === s);
  return hit ?? "Workflow";
}

function xFromTime(t: number, minT: number, scale: number, offset: number): number {
  return LEFT_GUTTER + ((t - minT) / MS_PER_DAY) * scale + offset;
}

function timeFromX(x: number, minT: number, scale: number, offset: number): number {
  return minT + ((x - LEFT_GUTTER - offset) / scale) * MS_PER_DAY;
}

export type TimelineCanvasHandle = {
  zoomIn: () => void;
  zoomOut: () => void;
  fit: () => void;
};

type TimelineCanvasProps = {
  events: TlEvent[];
  shellRef: React.RefObject<HTMLDivElement | null>;
  onViewportLabelChange?: (label: string) => void;
};

type TooltipState = { ev: TlEvent; left: number; top: number };

const TimelineCanvas = forwardRef<TimelineCanvasHandle, TimelineCanvasProps>(function TimelineCanvas(
  { events: rawEvents, shellRef, onViewportLabelChange },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const tlRef = useRef({
    scale: 1,
    targetScale: 1,
    offset: 0,
    targetOffset: 0,
    minTime: 0,
    maxTime: 0,
    events: [] as TlEvent[],
    hovered: null as TlEvent | null,
  });
  const dragRef = useRef({ active: false, lx: 0, startX: 0, dragged: false });
  const selectedRef = useRef<TlEvent | null>(null);
  const lastViewportLabelRef = useRef("");
  const onViewportLabelChangeRef = useRef(onViewportLabelChange);

  const [selected, setSelected] = useState<TlEvent | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  useEffect(() => {
    onViewportLabelChangeRef.current = onViewportLabelChange;
  }, [onViewportLabelChange]);

  const fitAll = useCallback(() => {
    const canvas = canvasRef.current;
    const tl = tlRef.current;
    if (!canvas) return;
    const { width: W } = canvas.getBoundingClientRect();
    const usableW = Math.max(120, W - LEFT_GUTTER - 20);
    const spanDays = Math.max((tl.maxTime - tl.minTime) / MS_PER_DAY, 0.25);
    const s = usableW / (spanDays + 0.6);
    const mid = (tl.minTime + tl.maxTime) / 2;
    const cx = LEFT_GUTTER + (W - LEFT_GUTTER) / 2;
    tl.targetScale = Math.max(6, Math.min(900, s));
    tl.targetOffset = cx - LEFT_GUTTER - ((mid - tl.minTime) / MS_PER_DAY) * tl.targetScale;
  }, []);

  const zoomAround = useCallback((factor: number, anchorX: number | null) => {
    const canvas = canvasRef.current;
    const tl = tlRef.current;
    if (!canvas) return;
    const W = canvas.getBoundingClientRect().width;
    const cx = anchorX ?? LEFT_GUTTER + (W - LEFT_GUTTER) / 2;
    const tMid = timeFromX(cx, tl.minTime, tl.targetScale, tl.targetOffset);
    const newScale = Math.max(6, Math.min(900, tl.targetScale * factor));
    tl.targetScale = newScale;
    tl.targetOffset = cx - LEFT_GUTTER - ((tMid - tl.minTime) / MS_PER_DAY) * newScale;
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      zoomIn: () => zoomAround(1 / 0.78, null),
      zoomOut: () => zoomAround(0.78, null),
      fit: () => fitAll(),
    }),
    [fitAll, zoomAround],
  );

  useEffect(() => {
    const c0 = canvasRef.current;
    const s0 = shellRef.current;
    if (c0 == null || s0 == null) return;
    const canvas = c0;
    const shell = s0;

    const sorted = [...rawEvents].sort(
      (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
    );
    const minTime = sorted.length
      ? new Date(sorted[0]!.occurredAt).getTime()
      : Date.now() - 7 * MS_PER_DAY;
    const maxTime = sorted.length
      ? new Date(sorted[sorted.length - 1]!.occurredAt).getTime()
      : Date.now();
    const tl = tlRef.current;
    tl.events = sorted;
    tl.minTime = minTime;
    tl.maxTime = Math.max(maxTime, minTime + MS_PER_DAY * 0.25);
    lastViewportLabelRef.current = "";

    function sizeCanvasToShell() {
      const dpr = window.devicePixelRatio || 1;
      const rect = shell.getBoundingClientRect();
      canvas.width = Math.max(1, rect.width * dpr);
      canvas.height = Math.max(1, rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    }

    function applyFitAll() {
      fitAll();
      tl.scale = tl.targetScale;
      tl.offset = tl.targetOffset;
    }

    let rootBg =
      getComputedStyle(document.documentElement).getPropertyValue("--color-canvas").trim() || "#f1f4f8";

    function refreshThemeBg() {
      rootBg =
        getComputedStyle(document.documentElement).getPropertyValue("--color-canvas").trim() || "#f1f4f8";
    }

    sizeCanvasToShell();
    applyFitAll();

    let lastViewportEmitAt = 0;
    const VIEWPORT_LABEL_MIN_MS = 120;

    const ro = new ResizeObserver(() => {
      sizeCanvasToShell();
      refreshThemeBg();
    });
    ro.observe(shell);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const dx = e.deltaX;
      const dy = e.deltaY;
      if (e.shiftKey) {
        tl.targetOffset += dy;
        return;
      }
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);
      // Symmetric axes: only pan when clearly horizontal, only zoom when clearly vertical.
      // Ignores ambiguous diagonals so horizontal scroll does not nudge zoom.
      const panHorizontal = adx > ady * 1.2 && adx >= 2;
      const zoomVertical = ady > adx * 1.2 && ady >= 2;
      if (panHorizontal) {
        tl.targetOffset -= dx;
        return;
      }
      if (zoomVertical) {
        const factor = dy > 0 ? 0.92 : 1 / 0.92;
        zoomAround(factor, mx);
      }
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });

    function draw() {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      const tl = tlRef.current;

      tl.scale += (tl.targetScale - tl.scale) * 0.14;
      tl.offset += (tl.targetOffset - tl.offset) * 0.14;

      const axisTop = H - RULER_H;
      const innerH = Math.max(80, axisTop - TOP_PAD);

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = rootBg;
      ctx.fillRect(0, 0, W, H);

      const laneYs = (Object.keys(DOMAIN_LANES) as DomainKey[]).map((k) => {
        const lane = DOMAIN_LANES[k];
        return { key: k, lane, py: TOP_PAD + lane.y * innerH };
      });

      ctx.strokeStyle = "rgba(15, 23, 42, 0.07)";
      ctx.lineWidth = 1;
      for (const ly of laneYs) {
        ctx.beginPath();
        ctx.moveTo(LEFT_GUTTER, ly.py);
        ctx.lineTo(W - 8, ly.py);
        ctx.stroke();
      }

      const t0 = tl.minTime - MS_PER_DAY;
      const t1 = tl.maxTime + MS_PER_DAY;
      for (let t = Math.floor(t0 / MS_PER_DAY) * MS_PER_DAY; t <= t1; t += MS_PER_DAY) {
        const x = xFromTime(t, tl.minTime, tl.scale, tl.offset);
        if (x < LEFT_GUTTER - 4 || x > W + 4) continue;
        ctx.beginPath();
        ctx.moveTo(x, TOP_PAD);
        ctx.lineTo(x, axisTop);
        ctx.strokeStyle = "rgba(15, 23, 42, 0.045)";
        ctx.stroke();
      }

      ctx.fillStyle = "rgba(15, 23, 42, 0.04)";
      ctx.fillRect(0, TOP_PAD, LEFT_GUTTER - 6, innerH);

      ctx.font = "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (const ly of laneYs) {
        ctx.fillStyle = ly.lane.color;
        ctx.fillText(ly.lane.label, LEFT_GUTTER - 8, ly.py);
      }

      const now = Date.now();
      const nowX = xFromTime(now, tl.minTime, tl.scale, tl.offset);
      if (nowX >= LEFT_GUTTER && nowX <= W - 4) {
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = "rgba(13, 148, 136, 0.45)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(nowX, TOP_PAD);
        ctx.lineTo(nowX, axisTop);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(13, 148, 136, 0.9)";
        ctx.font = "700 9px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.textAlign = "center";
        ctx.fillText("NOW", nowX, TOP_PAD - 6);
      }

      for (const ev of tl.events) {
        const tEv = new Date(ev.occurredAt).getTime();
        const x = xFromTime(tEv, tl.minTime, tl.scale, tl.offset);
        const lk = laneKey(ev.domain);
        const py = TOP_PAD + DOMAIN_LANES[lk].y * innerH;
        if (x < LEFT_GUTTER - 20 || x > W + 20) continue;
        const isHi = tl.hovered?.id === ev.id || selectedRef.current?.id === ev.id;
        const r = eventMarkerRadius(isHi, tl.scale);
        const col = DOMAIN_LANES[lk].color;
        const glowR = isHi ? r + 8 : r + 4;
        ctx.beginPath();
        ctx.arc(x, py, glowR, 0, Math.PI * 2);
        ctx.fillStyle = isHi ? `${col}50` : `${col}32`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, py, r, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = isHi ? 2 : 1.25;
        ctx.stroke();
        const icon = EV_ICONS[ev.eventType] ?? "•";
        ctx.fillStyle = "#fff";
        ctx.font = "600 12px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(icon, x, py + 0.5);
      }

      const tLeft = timeFromX(LEFT_GUTTER, tl.minTime, tl.scale, tl.offset);
      const tRight = timeFromX(W, tl.minTime, tl.scale, tl.offset);
      const lo = Math.min(tLeft, tRight);
      const hi = Math.max(tLeft, tRight);
      const visibleMs = Math.max(MS_PER_DAY * 0.02, hi - lo);
      const rangeLabel = formatVisibleRangeLabel(lo, hi);
      const tEmit = performance.now();
      if (
        rangeLabel !== lastViewportLabelRef.current &&
        tEmit - lastViewportEmitAt >= VIEWPORT_LABEL_MIN_MS
      ) {
        lastViewportLabelRef.current = rangeLabel;
        lastViewportEmitAt = tEmit;
        onViewportLabelChangeRef.current?.(rangeLabel);
      }

      ctx.strokeStyle = "rgba(15, 23, 42, 0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(LEFT_GUTTER, axisTop);
      ctx.lineTo(W - 8, axisTop);
      ctx.stroke();

      const plotW = Math.max(40, W - LEFT_GUTTER);
      const step = pickTickStep(visibleMs, plotW);
      ctx.fillStyle = "rgba(71, 85, 105, 0.88)";
      ctx.font = "600 10px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textBaseline = "top";
      for (let tk = alignTickStart(lo - step, step); tk <= hi + step; tk += step) {
        const x = xFromTime(tk, tl.minTime, tl.scale, tl.offset);
        if (x < LEFT_GUTTER - 2 || x > W + 2) continue;
        ctx.strokeStyle = "rgba(15, 23, 42, 0.14)";
        ctx.beginPath();
        ctx.moveTo(x, axisTop);
        ctx.lineTo(x, axisTop + 7);
        ctx.stroke();
        ctx.textAlign = "center";
        const label = formatTickLabel(tk, step);
        ctx.fillText(label, x, axisTop + 11);
      }

      ctx.restore();
    }

    function loop() {
      draw();
      frameRef.current = requestAnimationFrame(loop);
    }
    frameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [rawEvents, shellRef, fitAll, zoomAround]);

  function innerMetrics(canvasH: number) {
    const axisTop = canvasH - RULER_H;
    const innerH = Math.max(80, axisTop - TOP_PAD);
    return { axisTop, innerH };
  }

  function getEventAt(mx: number, my: number): TlEvent | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = mx - rect.left;
    const y = my - rect.top;
    const tl = tlRef.current;
    const { innerH } = innerMetrics(rect.height);
    const hitR = eventHitRadiusPx(tl.scale);
    let best: TlEvent | null = null;
    let bestD = hitR;
    for (const ev of tl.events) {
      const tEv = new Date(ev.occurredAt).getTime();
      const ex = xFromTime(tEv, tl.minTime, tl.scale, tl.offset);
      const lk = laneKey(ev.domain);
      const ey = TOP_PAD + DOMAIN_LANES[lk].y * innerH;
      const d = Math.hypot(ex - x, ey - y);
      if (d < bestD) {
        bestD = d;
        best = ev;
      }
    }
    return best;
  }

  function updateTooltipFromPointer(clientX: number, clientY: number) {
    const inner = innerRef.current;
    if (!inner) return;
    const hit = getEventAt(clientX, clientY);
    tlRef.current.hovered = hit;
    if (!hit) {
      setTooltip(null);
      return;
    }
    const b = inner.getBoundingClientRect();
    const relX = clientX - b.left;
    const relY = clientY - b.top;
    const iw = inner.clientWidth;
    const ih = inner.clientHeight;
    const left = Math.min(Math.max(8, relX + 14), Math.max(8, iw - 268));
    const top = Math.min(Math.max(8, relY + 14), Math.max(8, ih - 120));
    setTooltip({ ev: hit, left, top });
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (dragRef.current.active) {
      if (Math.abs(e.clientX - dragRef.current.startX) > 4) dragRef.current.dragged = true;
      const dx = e.clientX - dragRef.current.lx;
      dragRef.current.lx = e.clientX;
      tlRef.current.targetOffset -= dx;
      return;
    }
    const hit = getEventAt(e.clientX, e.clientY);
    tlRef.current.hovered = hit;
    canvas.style.cursor = hit ? "pointer" : "grab";
    updateTooltipFromPointer(e.clientX, e.clientY);
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = canvasRef.current;
    if (!c) return;
    c.setPointerCapture(e.pointerId);
    dragRef.current = { active: true, lx: e.clientX, startX: e.clientX, dragged: false };
    setTooltip(null);
    c.style.cursor = "grabbing";
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = canvasRef.current;
    if (c?.hasPointerCapture(e.pointerId)) c.releasePointerCapture(e.pointerId);
    const didDrag = dragRef.current.dragged;
    dragRef.current.active = false;
    if (c) c.style.cursor = "grab";
    const hit = getEventAt(e.clientX, e.clientY);
    if (hit && !didDrag) {
      const next = selectedRef.current?.id === hit.id ? null : hit;
      selectedRef.current = next;
      setSelected(next);
    }
    dragRef.current.dragged = false;
    updateTooltipFromPointer(e.clientX, e.clientY);
  }

  return (
    <div ref={innerRef} className={styles.timelineCanvasInner}>
      <canvas
        ref={canvasRef}
        className={styles.timelineCanvas}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={() => {
          if (dragRef.current.active) return;
          tlRef.current.hovered = null;
          setTooltip(null);
          if (canvasRef.current) canvasRef.current.style.cursor = "grab";
        }}
      />
      {tooltip ? (
        <div className={styles.timelineTooltip} style={{ left: tooltip.left, top: tooltip.top }}>
          <div className={styles.timelineTooltipDomain} style={{ color: DOMAIN_LANES[laneKey(tooltip.ev.domain)].color }}>
            {tooltip.ev.domain ?? "—"}
          </div>
          <div className={styles.timelineTooltipType}>{tooltip.ev.eventType.replace(/_/g, " ")}</div>
          <div className={styles.timelineTooltipTime}>
            {new Date(tooltip.ev.occurredAt).toLocaleString(undefined, {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
        </div>
      ) : null}
      {selected ? (
        <div className={styles.eventDetailPanel}>
          <div className={styles.timelineDetailHeader}>
            {(() => {
              const lane = DOMAIN_LANES[laneKey(selected.domain)];
              return (
                <>
                  <JarvisTag label={selected.domain ?? "—"} color={lane.color} />
                  <button
                    type="button"
                    className={styles.nodeDetailClose}
                    onClick={() => {
                      selectedRef.current = null;
                      setSelected(null);
                    }}
                  >
                    ✕
                  </button>
                </>
              );
            })()}
          </div>
          <div className={styles.timelineDetailType}>{selected.eventType.replace(/_/g, " ")}</div>
          <div className={styles.timelineDetailDate}>
            {new Date(selected.occurredAt).toLocaleString(undefined, {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          {selected.workflowId ? (
            <div className={styles.timelineDetailBlock}>
              <div className={styles.timelineDetailLabel}>Workflow</div>
              <div className={styles.timelineDetailValue}>{selected.workflowId}</div>
            </div>
          ) : null}
          {selected.payload && Object.keys(selected.payload).length > 0 ? (
            <div className={styles.eventDetailPayload}>
              <div className={styles.eventDetailPayloadCorner} />
              <div className={styles.eventDetailPayloadLabel}>Payload</div>
              <div className={styles.eventDetailPayloadRows}>
                {Object.entries(selected.payload).map(([k, v]) => (
                  <div key={k} className={styles.eventDetailPayloadRow}>
                    <span className={styles.eventDetailPayloadKey}>{k.replace(/_/g, " ")}</span>
                    <span
                      className={styles.eventDetailPayloadVal}
                      style={{ color: DOMAIN_LANES[laneKey(selected.domain)].color }}
                    >
                      {typeof v === "object" ? JSON.stringify(v) : String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});

function toTlEvents(backendEvents: MemoryEventV1[]): TlEvent[] {
  return backendEvents.map((e) => ({
    ...e,
    payload: e.payloadPreview ? { preview: e.payloadPreview } : undefined,
  }));
}

export function TimelinePanel() {
  const load = useCallback(() => fetchMemoryEvents(CURRENT_USER_ID, 100), []);
  const res = useAsyncResource(load, "timeline");
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasHandleRef = useRef<TimelineCanvasHandle>(null);
  const [rangeLabel, setRangeLabel] = useState("");

  const events = useMemo(() => {
    if (res.status !== "success") return [];
    return toTlEvents(res.data);
  }, [res]);

  if (res.status === "loading") {
    return (
      <JarvisCard hover={false} className={styles.canvasChromeCard}>
        <p className={styles.timelineChromeLead}>Loading activity timeline…</p>
      </JarvisCard>
    );
  }
  if (res.status === "error") {
    return (
      <JarvisCard hover={false} className={styles.canvasChromeCard}>
        <JarvisInlineError title="Timeline" message={formatLoadError(res.error)} />
      </JarvisCard>
    );
  }

  if (events.length === 0) {
    return (
      <JarvisCard hover={false} className={styles.canvasChromeCard}>
        <p className={styles.timelineChromeLead}>No events recorded yet.</p>
      </JarvisCard>
    );
  }

  return (
    <div className={`${styles.canvasPanel} ${styles.timelineCanvasPanel}`}>
      <div className={styles.timelineToolbar}>
        <span className={styles.timelineZoomLabel}>Zoom</span>
        <button
          type="button"
          className={styles.timelineZoomBtn}
          onClick={() => canvasHandleRef.current?.zoomOut()}
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          type="button"
          className={styles.timelineZoomBtn}
          onClick={() => canvasHandleRef.current?.zoomIn()}
          aria-label="Zoom in"
        >
          +
        </button>
        <button type="button" className={styles.timelineFitBtn} onClick={() => canvasHandleRef.current?.fit()}>
          Fit all
        </button>
        {rangeLabel ? <span className={styles.timelineVisibleRange}>{rangeLabel}</span> : null}
        <div className={styles.timelineLegend}>
          {(Object.keys(DOMAIN_LANES) as DomainKey[]).map((k) => {
            const lane = DOMAIN_LANES[k];
            return (
              <div key={lane.label} className={styles.timelineLegendItem}>
                <div className={styles.timelineLegendDot} style={{ background: lane.color }} />
                <span className={styles.timelineLegendLabel}>{lane.label}</span>
              </div>
            );
          })}
          <span className={styles.timelineEventCount}>{events.length} events</span>
        </div>
      </div>
      <div ref={wrapRef} className={styles.timelineCanvasShell}>
        <TimelineCanvas
          ref={canvasHandleRef}
          events={events}
          shellRef={wrapRef}
          onViewportLabelChange={setRangeLabel}
        />
      </div>
    </div>
  );
}
