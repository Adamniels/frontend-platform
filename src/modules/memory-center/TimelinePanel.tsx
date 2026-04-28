"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import { formatLoadError } from "@/lib/utils/error-message";
import { useAsyncResource } from "@/lib/hooks/use-async-resource";
import { CURRENT_USER_ID, fetchMemoryEvents, type MemoryEventV1 } from "@/lib/api/adapters/memory-center";
import styles from "./memory-center.module.css";

// ── Lane config ───────────────────────────────────────────────────────────────

const DOMAIN_LANES: Record<string, { y: number; color: string; rgb: string; label: string }> = {
  Learning:       { y: 0.18, color: "#00d4ff", rgb: "0,212,255",    label: "LEARNING"       },
  Workflow:       { y: 0.38, color: "#ff9500", rgb: "255,149,0",    label: "WORKFLOW"       },
  Recommendation: { y: 0.62, color: "#e879f9", rgb: "232,121,249",  label: "RECOMMENDATION" },
  Profile:        { y: 0.80, color: "#34d399", rgb: "52,211,153",   label: "PROFILE"        },
};

const AXIS_Y_FRAC = 0.50;
const MS_PER_DAY  = 86400000;

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
  _x?: number; _y?: number; _r?: number;
  payload?: Record<string, unknown>;
};

// ── Canvas component ──────────────────────────────────────────────────────────

type TimelineCanvasProps = { events: TlEvent[]; outerRef: React.RefObject<HTMLDivElement | null> };

function TimelineCanvas({ events: rawEvents, outerRef }: TimelineCanvasProps) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const frameRef    = useRef<number>(0);
  const tickRef     = useRef(0);
  const dprRef      = useRef(1);

  const tlRef = useRef({
    scale: 0, targetScale: 0,
    offset: 0, targetOffset: 0,
    minTime: 0, maxTime: 0,
    events: [] as TlEvent[],
    hovered: null as TlEvent | null,
    entryProgress: 0,
  });

  const dragRef     = useRef({ active: false, lx: 0, startOffset: 0 });
  const selectedRef = useRef<TlEvent | null>(null);
  const [selected, setSelected] = useState<TlEvent | null>(null);

  function fitAll() {
    const tl = tlRef.current;
    const canvas = canvasRef.current; if (!canvas) return;
    const W = canvas.getBoundingClientRect().width;
    const span = (tl.maxTime - tl.minTime) / MS_PER_DAY;
    const pad  = 2.5;
    const s    = W / (span + pad * 2);
    const o    = W * 0.5 - ((tl.maxTime + tl.minTime) / 2 / MS_PER_DAY) * s + (tl.minTime / MS_PER_DAY) * s;
    tl.targetScale  = s;
    tl.targetOffset = o - pad * s;
  }

  function zoomAround(factor: number) {
    const tl = tlRef.current;
    const canvas = canvasRef.current; if (!canvas) return;
    const W  = canvas.getBoundingClientRect().width;
    const cx = W / 2;
    const newScale = Math.max(8, Math.min(800, tl.targetScale * factor));
    const mid = tl.minTime + ((cx - tl.targetOffset) / tl.targetScale) * MS_PER_DAY;
    tl.targetOffset = cx - ((mid - tl.minTime) / MS_PER_DAY) * newScale;
    tl.targetScale  = newScale;
  }

  // Expose zoom/fit to toolbar via DOM events on the outer wrapper
  useEffect(() => {
    const el = outerRef.current; if (!el) return;
    const onZoomIn  = () => zoomAround(1 / 0.7);
    const onZoomOut = () => zoomAround(0.7);
    const onFit     = () => fitAll();
    el.addEventListener("tl:zoom-in",  onZoomIn);
    el.addEventListener("tl:zoom-out", onZoomOut);
    el.addEventListener("tl:fit",      onFit);
    return () => {
      el.removeEventListener("tl:zoom-in",  onZoomIn);
      el.removeEventListener("tl:zoom-out", onZoomOut);
      el.removeEventListener("tl:fit",      onFit);
    };
  }, [outerRef]);

  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = outerRef.current;
    if (!canvas || !container) return;

    const sorted = [...rawEvents].sort(
      (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
    );
    const minTime = new Date(sorted[0]?.occurredAt ?? Date.now()).getTime();
    const maxTime = new Date(sorted[sorted.length - 1]?.occurredAt ?? Date.now()).getTime();
    const tl = tlRef.current;
    tl.events = sorted; tl.minTime = minTime; tl.maxTime = maxTime;
    tl.entryProgress = 0;

    function initScale(W: number) {
      const span = (maxTime - minTime) / MS_PER_DAY;
      const pad  = 2.5;
      const s    = W / (span + pad * 2);
      const o    = W * 0.5 - ((maxTime + minTime) / 2 / MS_PER_DAY) * s + (minTime / MS_PER_DAY) * s;
      tl.scale = s; tl.targetScale = s;
      tl.offset = o - pad * s; tl.targetOffset = o - pad * s;
    }

    function resize() {
      const dpr  = window.devicePixelRatio || 1; dprRef.current = dpr;
      const rect = container!.getBoundingClientRect();
      canvas!.width  = rect.width  * dpr;
      canvas!.height = rect.height * dpr;
      canvas!.style.width  = rect.width  + "px";
      canvas!.style.height = rect.height + "px";
      if (tl.scale === 0) initScale(rect.width);
    }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(container);

    function timeToX(t: number) { return tl.offset + ((t - tl.minTime) / MS_PER_DAY) * tl.scale; }
    function xToTime(x: number) { return tl.minTime + ((x - tl.offset) / tl.scale) * MS_PER_DAY; }

    function draw() {
      const ctx  = canvas!.getContext("2d")!;
      const dpr  = dprRef.current;
      const W    = canvas!.width  / dpr;
      const H    = canvas!.height / dpr;
      const time = tickRef.current / 60;

      tl.scale  += (tl.targetScale  - tl.scale)  * 0.14;
      tl.offset += (tl.targetOffset - tl.offset)  * 0.14;
      tl.entryProgress = Math.min(1, tl.entryProgress + 0.018);

      ctx.save(); ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#04080e"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(0,212,255,0.04)"; ctx.lineWidth = 0.5;
      for (let gx = 0; gx < W; gx += 42) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
      for (let gy = 0; gy < H; gy += 42) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

      const axisY   = H * AXIS_Y_FRAC;
      const LABEL_W = 120;

      ctx.save();
      ctx.beginPath(); ctx.rect(LABEL_W, 0, W - LABEL_W, H); ctx.clip();

      const visStart = xToTime(LABEL_W), visEnd = xToTime(W);
      const d = new Date(visStart); d.setHours(0, 0, 0, 0);
      while (d.getTime() < visEnd) {
        const x = timeToX(d.getTime());
        const isMonday = d.getDay() === 1;
        ctx.strokeStyle = isMonday ? "rgba(0,212,255,0.15)" : "rgba(0,212,255,0.06)";
        ctx.lineWidth   = isMonday ? 1 : 0.5;
        ctx.setLineDash(isMonday ? [] : [4, 6]);
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        ctx.setLineDash([]);
        if (tl.scale > 30) {
          const label = d.toLocaleDateString("en-SE", { month: "short", day: "numeric" }).toUpperCase();
          ctx.font = "8px 'Space Mono',monospace"; ctx.fillStyle = "rgba(0,212,255,0.4)"; ctx.textAlign = "left";
          ctx.fillText(label, x + 4, axisY + 12);
        }
        d.setDate(d.getDate() + 1);
      }

      ctx.shadowColor = "#00d4ff"; ctx.shadowBlur = 8;
      ctx.strokeStyle = "rgba(0,212,255,0.6)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(LABEL_W, axisY); ctx.lineTo(W, axisY); ctx.stroke();
      ctx.shadowBlur = 0;

      const nowX = timeToX(new Date().getTime());
      if (nowX >= LABEL_W && nowX <= W) {
        ctx.strokeStyle = "#ff9500"; ctx.lineWidth = 1.5;
        ctx.shadowColor = "#ff9500"; ctx.shadowBlur = 12;
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(nowX, 20); ctx.lineTo(nowX, H - 20); ctx.stroke();
        ctx.setLineDash([]); ctx.shadowBlur = 0;
        ctx.font = "7px 'Space Mono',monospace"; ctx.fillStyle = "#ff9500"; ctx.textAlign = "center";
        ctx.fillText("NOW", nowX, 14);
      }

      Object.values(DOMAIN_LANES).forEach((lane) => {
        const laneY = H * lane.y;
        ctx.strokeStyle = `rgba(${lane.rgb},0.08)`; ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 8]);
        ctx.beginPath(); ctx.moveTo(LABEL_W, laneY); ctx.lineTo(W, laneY); ctx.stroke();
        ctx.setLineDash([]);
      });

      const hovId = tl.hovered?.id ?? null;
      const selId = selectedRef.current?.id ?? null;

      tl.events.forEach((ev, i) => {
        const lane = DOMAIN_LANES[ev.domain ?? ""];
        if (!lane) return;
        const evTime = new Date(ev.occurredAt).getTime();
        const x = timeToX(evTime);
        if (x < LABEL_W - 20 || x > W + 20) return;

        const laneY = H * lane.y;
        const isHov = hovId === ev.id, isSel = selId === ev.id;
        const entryDelay = (i / tl.events.length) * 0.6;
        const entryAlpha = Math.min(1, Math.max(0, (tl.entryProgress - entryDelay) / 0.4));
        if (entryAlpha <= 0) return;

        ctx.strokeStyle = `rgba(${lane.rgb},${(isHov||isSel?0.7:0.3)*entryAlpha})`;
        ctx.lineWidth = isHov||isSel ? 1.5 : 0.8;
        ctx.beginPath(); ctx.moveTo(x, axisY);
        const cpY = axisY + (laneY - axisY) * 0.5;
        ctx.bezierCurveTo(x, cpY, x, cpY, x, laneY); ctx.stroke();

        ctx.strokeStyle = `rgba(${lane.rgb},${0.8*entryAlpha})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x, axisY-4); ctx.lineTo(x, axisY+4); ctx.stroke();

        const pulse = 1 + Math.sin(time * 1.8 + i * 0.7) * 0.12;
        const baseR = isHov||isSel ? 8 : 5.5;
        const r     = baseR * pulse;

        const halo = ctx.createRadialGradient(x, laneY, 0, x, laneY, r+14);
        halo.addColorStop(0, `rgba(${lane.rgb},${(isHov||isSel?0.6:0.25)*entryAlpha})`);
        halo.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(x, laneY, r+14, 0, Math.PI*2); ctx.fillStyle = halo; ctx.fill();

        ctx.beginPath(); ctx.arc(x, laneY, r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(${lane.rgb},${0.15*entryAlpha})`;
        ctx.strokeStyle = `rgba(${lane.rgb},${(isHov||isSel?1:0.8)*entryAlpha})`;
        ctx.lineWidth = isHov||isSel ? 2 : 1.2;
        ctx.globalAlpha = entryAlpha;
        if (isSel) { ctx.shadowColor = lane.color; ctx.shadowBlur = 16; }
        ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;

        const icon = EV_ICONS[ev.eventType] ?? "·";
        ctx.font = `${Math.max(7, r*0.9)}px monospace`;
        ctx.fillStyle = lane.color; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.globalAlpha = entryAlpha * 0.9; ctx.fillText(icon, x, laneY);
        ctx.textBaseline = "alphabetic"; ctx.globalAlpha = 1;

        if (tl.scale > 80 || isHov || isSel) {
          const lbl = ev.eventType.replace(/_/g, " ").toUpperCase();
          const fs  = Math.min(9, Math.max(7, tl.scale * 0.04));
          ctx.font = `${isHov||isSel?"bold ":""}${fs}px 'Space Mono',monospace`;
          ctx.fillStyle = isHov||isSel ? lane.color : `rgba(${lane.rgb},0.6)`;
          ctx.textAlign = "center"; ctx.globalAlpha = entryAlpha * (isHov||isSel ? 1 : 0.7);
          const labelY = laneY < axisY ? laneY - r - 8 : laneY + r + 14;
          ctx.fillText(lbl.length > 20 ? lbl.slice(0,18)+"…" : lbl, x, labelY);
          ctx.globalAlpha = 1;
        }

        ev._x = x; ev._y = laneY; ev._r = r + 8;
      });

      ctx.restore();

      ctx.fillStyle = "rgba(4,8,14,0.92)"; ctx.fillRect(0, 0, LABEL_W, H);
      ctx.strokeStyle = "rgba(0,212,255,0.2)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(LABEL_W, 0); ctx.lineTo(LABEL_W, H); ctx.stroke();

      Object.values(DOMAIN_LANES).forEach((lane) => {
        const laneY = H * lane.y;
        ctx.beginPath(); ctx.arc(LABEL_W - 12, laneY, 4, 0, Math.PI*2);
        ctx.fillStyle = lane.color; ctx.shadowColor = lane.color; ctx.shadowBlur = 8;
        ctx.fill(); ctx.shadowBlur = 0;
        ctx.font = "8px 'Space Mono',monospace"; ctx.fillStyle = `rgba(${lane.rgb},0.7)`;
        ctx.textAlign = "right"; ctx.textBaseline = "middle";
        ctx.fillText(lane.label, LABEL_W - 22, laneY);
        ctx.textBaseline = "alphabetic";
      });
      ctx.font = "8px 'Space Mono',monospace"; ctx.fillStyle = "rgba(0,212,255,0.5)";
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText("TIMELINE", LABEL_W - 22, H * AXIS_Y_FRAC);
      ctx.textBaseline = "alphabetic";

      if (tl.hovered && tl.hovered._x != null) {
        const ev   = tl.hovered;
        const lane = DOMAIN_LANES[ev.domain ?? ""];
        if (lane) {
          const tx = Math.min(ev._x! + 14, W - 200);
          const ty = Math.max(ev._y! - 58, 8);
          ctx.fillStyle = "rgba(4,8,14,0.97)";
          ctx.strokeStyle = `rgba(${lane.rgb},0.7)`; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.rect(tx, ty, 192, 50); ctx.fill(); ctx.stroke();
          [[tx,ty,1,1],[tx+192,ty+50,-1,-1]].forEach(([bx,by,sx,sy]) => {
            ctx.strokeStyle = lane.color; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(bx+sx*7, by); ctx.lineTo(bx, by); ctx.lineTo(bx, by+sy*7); ctx.stroke();
          });
          const evDate = new Date(ev.occurredAt);
          ctx.font = "bold 9px 'Space Mono',monospace"; ctx.fillStyle = lane.color; ctx.textAlign = "left";
          ctx.fillText(ev.eventType.replace(/_/g," ").toUpperCase(), tx+10, ty+16);
          ctx.font = "8px 'Space Mono',monospace"; ctx.fillStyle = "rgba(232,237,248,0.5)";
          ctx.fillText(evDate.toLocaleDateString("en-SE",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).toUpperCase(), tx+10, ty+30);
          if (ev.workflowId) { ctx.fillStyle="rgba(232,237,248,0.25)"; ctx.fillText(ev.workflowId, tx+10, ty+44); }
        }
      }

      if (tickRef.current < 90) {
        ctx.font = "8px 'Space Mono',monospace"; ctx.fillStyle = "rgba(0,212,255,0.3)"; ctx.textAlign = "center";
        ctx.fillText("SCROLL: ZOOM  ·  DRAG: PAN  ·  CLICK: SELECT", W/2, H-12);
      }
      ctx.font = "8px 'Space Mono',monospace"; ctx.fillStyle = "rgba(0,212,255,0.3)"; ctx.textAlign = "right";
      ctx.fillText(`${tl.scale.toFixed(0)}PX/DAY`, W-12, H-12);

      ctx.restore();
    }

    function loop() { draw(); tickRef.current++; frameRef.current = requestAnimationFrame(loop); }
    frameRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(frameRef.current); ro.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawEvents]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const tl = tlRef.current;
      const rect = canvas.getBoundingClientRect(), mx = e.clientX - rect.left;
      const factor = e.deltaY > 0 ? 0.88 : 1.12;
      const newScale = Math.max(8, Math.min(800, tl.targetScale * factor));
      const timeAtCursor = tl.minTime + ((mx - tl.targetOffset) / tl.targetScale) * MS_PER_DAY;
      tl.targetOffset = mx - ((timeAtCursor - tl.minTime) / MS_PER_DAY) * newScale;
      tl.targetScale  = newScale;
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => { canvas.removeEventListener("wheel", onWheel); };
  }, []);

  useEffect(() => {
    const end = () => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      const c = canvasRef.current;
      if (c) c.style.cursor = "grab";
    };
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, []);

  function getEventAt(ex: number, ey: number): TlEvent | null {
    const canvas = canvasRef.current; if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const mx = ex - rect.left, my = ey - rect.top;
    for (const ev of tlRef.current.events) {
      if (ev._x == null) continue;
      const d = Math.sqrt((mx - ev._x)**2 + (my - (ev._y??0))**2);
      if (d < (ev._r ?? 10)) return ev;
    }
    return null;
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (dragRef.current.active) {
      const dx = e.clientX - dragRef.current.lx;
      tlRef.current.targetOffset = dragRef.current.startOffset + dx;
      dragRef.current.lx = e.clientX;
      dragRef.current.startOffset = tlRef.current.targetOffset;
    } else {
      tlRef.current.hovered = getEventAt(e.clientX, e.clientY);
      canvasRef.current!.style.cursor = tlRef.current.hovered ? "pointer" : "grab";
    }
  }

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    dragRef.current = { active: true, lx: e.clientX, startOffset: tlRef.current.targetOffset };
    canvasRef.current!.style.cursor = "grabbing";
  }

  function onMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
    dragRef.current.active = false;
    canvasRef.current!.style.cursor = "grab";
    const ev = getEventAt(e.clientX, e.clientY);
    if (ev) {
      const next = selectedRef.current?.id === ev.id ? null : ev;
      selectedRef.current = next; setSelected(next);
    }
  }

  return (
    <div style={{ flex: 1, position: "relative", minWidth: 0, cursor: "grab" }}>
      <canvas
        ref={canvasRef}
        onMouseMove={onMouseMove} onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={() => { tlRef.current.hovered = null; }}
        style={{ display: "block", width: "100%", height: "100%" }}
      />

      {selected && (() => {
        const lane = DOMAIN_LANES[selected.domain ?? ""] ?? DOMAIN_LANES.Workflow;
        return (
          <div className={styles.eventDetailPanel} style={{ position: "absolute", right: 0, top: 0, bottom: 0 }}>
            <div style={{ position: "absolute", top: -1, left: -1, width: 8, height: 8, borderTop: `1.5px solid ${lane.color}`, borderLeft: `1.5px solid ${lane.color}` }} />
            <div style={{ position: "absolute", bottom: -1, right: -1, width: 8, height: 8, borderBottom: `1.5px solid ${lane.color}`, borderRight: `1.5px solid ${lane.color}` }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <JarvisTag label={selected.domain ?? "—"} color={lane.color} />
              <button className={styles.nodeDetailClose} onClick={() => { selectedRef.current = null; setSelected(null); }}>✕</button>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: "var(--color-text)", letterSpacing: "0.5px", textTransform: "uppercase", lineHeight: 1.5 }}>
              {selected.eventType.replace(/_/g, " ")}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--color-text-dim)", letterSpacing: "0.8px" }}>
              {new Date(selected.occurredAt).toLocaleDateString("en-SE", { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).toUpperCase()}
            </div>
            {selected.workflowId && (
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "var(--color-text-dim)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 3 }}>Workflow</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: lane.color }}>{selected.workflowId}</div>
              </div>
            )}
            {selected.payload && Object.keys(selected.payload).length > 0 && (
              <div className={styles.eventDetailPayload}>
                <div className={styles.eventDetailPayloadCorner} />
                <div className={styles.eventDetailPayloadLabel}>Payload</div>
                <div className={styles.eventDetailPayloadRows}>
                  {Object.entries(selected.payload).map(([k, v]) => (
                    <div key={k} className={styles.eventDetailPayloadRow}>
                      <span className={styles.eventDetailPayloadKey}>{k.replace(/_/g, " ")}</span>
                      <span className={styles.eventDetailPayloadVal} style={{ color: lane.color }}>{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────

function toTlEvents(backendEvents: MemoryEventV1[]): TlEvent[] {
  return backendEvents.map((e) => ({
    ...e,
    payload: e.payloadPreview ? { preview: e.payloadPreview } : undefined,
  }));
}

export function TimelinePanel() {
  const load    = useCallback(() => fetchMemoryEvents(CURRENT_USER_ID, 100), []);
  const res     = useAsyncResource(load, "timeline");
  const wrapRef = useRef<HTMLDivElement>(null);

  if (res.status === "loading") {
    return <p className={styles.loadingText}>Loading activity timeline…</p>;
  }
  if (res.status === "error") {
    return <div className={styles.errorWrap}><JarvisInlineError title="Timeline" message={formatLoadError(res.error)} /></div>;
  }

  const events = toTlEvents(res.data);

  if (events.length === 0) {
    return <p className={styles.loadingText}>No events recorded yet.</p>;
  }

  return (
    <div className={styles.canvasPanel}>
      {/* Toolbar */}
      <div className={styles.timelineToolbar}>
        <span className={styles.timelineZoomLabel}>ZOOM</span>
        <button className={styles.timelineZoomBtn} onClick={() => wrapRef.current?.dispatchEvent(new Event("tl:zoom-out"))}>−</button>
        <button className={styles.timelineZoomBtn} onClick={() => wrapRef.current?.dispatchEvent(new Event("tl:zoom-in"))}>+</button>
        <button className={styles.timelineFitBtn}  onClick={() => wrapRef.current?.dispatchEvent(new Event("tl:fit"))}>Fit all</button>
        <div className={styles.timelineLegend}>
          {Object.values(DOMAIN_LANES).map((lane) => (
            <div key={lane.label} className={styles.timelineLegendItem}>
              <div className={styles.timelineLegendDot} style={{ background: lane.color, boxShadow: `0 0 5px ${lane.color}` }} />
              <span className={styles.timelineLegendLabel} style={{ color: `rgba(${lane.rgb},0.65)` }}>{lane.label}</span>
            </div>
          ))}
          <span className={styles.timelineEventCount}>{events.length} EVENTS</span>
        </div>
      </div>
      <div ref={wrapRef} style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
        <TimelineCanvas events={events} outerRef={wrapRef} />
      </div>
    </div>
  );
}
