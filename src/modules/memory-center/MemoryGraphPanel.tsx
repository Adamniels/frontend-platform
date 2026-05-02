"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { JarvisTag } from "@/components/jarvis/JarvisTag";
import { formatLoadError } from "@/lib/utils/error-message";
import { useAsyncResource } from "@/lib/hooks/use-async-resource";
import {
  CURRENT_USER_ID,
  fetchSemantics,
  fetchProceduralRules,
  fetchExplicitProfile,
  archiveSemantic,
  deprecateProceduralRule,
  type SemanticMemoryV1,
  type ProceduralRuleSummaryV1,
  type ProfileMemoryV1,
} from "@/lib/api/adapters/memory-center";
import {
  MOCK_RELATIONSHIPS,
} from "./memory-mock";
import styles from "./memory-center.module.css";

// ── Colours ──────────────────────────────────────────────────────────────────

const NODE_COLORS = {
  semantic:   { fill: "#6b8fc3", glow: "rgba(107,143,195,0.24)", bg: "rgba(107,143,195,0.08)", rgb: "107,143,195" },
  procedural: { fill: "#8f7aa8", glow: "rgba(143,122,168,0.22)", bg: "rgba(143,122,168,0.08)", rgb: "143,122,168" },
  profile:    { fill: "#79a88b", glow: "rgba(121,168,139,0.22)", bg: "rgba(121,168,139,0.08)", rgb: "121,168,139" },
} as const;

const TYPE_LABELS = { semantic: "Semantic", procedural: "Procedural", profile: "Profile Fact" } as const;

type NodeType = keyof typeof NODE_COLORS;

// ── Node / edge types ────────────────────────────────────────────────────────

type GraphNode = {
  id: string;
  type: NodeType;
  label: string;
  r: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  rx?: number; ry?: number; rz?: number;
  fx?: number; fy?: number; fz?: number;
  _px?: number; _py?: number; _pr?: number;
};

type Particle = { t: number; speed: number };

type GraphEdge = {
  src: string;
  tgt: string;
  label: string;
  particles: Particle[];
};

type GraphState = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  idMap: Record<string, GraphNode>;
  /** Spring rest length for edges — matched to the laid-out graph so the settle phase does not pull everything apart. */
  edgeRest: number;
};

type Vec3 = { x: number; y: number; z: number };

/** Orbit + look-at: eye sits on a sphere around `target`; view axis is eye→target. Scroll = dolly = change distance. */
type Camera = {
  target: Vec3;
  /** radians — orbit around world Y (horizontal drag) */
  yaw: number;
  /** radians — up/down (vertical drag) */
  pitch: number;
  /** world units — how far the eye is from `target` (scroll to move in/out along view) */
  distance: number;
};

// Pinhole: screen size for a world feature ∝ 1 / depth. `sc` = pixels per world unit in the depth direction.
const PERSP_FOCAL = 700;
const Z_MIN = 1.2;

function sub3(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}
function add3(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}
function len3(v: Vec3) {
  return Math.hypot(v.x, v.y, v.z) || 1e-6;
}
function norm3(v: Vec3): Vec3 {
  const l = len3(v);
  return { x: v.x / l, y: v.y / l, z: v.z / l };
}
function cross3(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}
function dot3(a: Vec3, b: Vec3) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}
function scale3(s: number, v: Vec3): Vec3 {
  return { x: s * v.x, y: s * v.y, z: s * v.z };
}

/** World-space position of the camera (eye) for current orbit. */
function orbitEyePosition(cam: Camera): Vec3 {
  const { target, distance, yaw, pitch } = cam;
  const cp = Math.cos(pitch);
  const dx = distance * cp * Math.sin(yaw);
  const dy = distance * Math.sin(pitch);
  const dz = distance * cp * Math.cos(yaw);
  return { x: target.x + dx, y: target.y + dy, z: target.z + dz };
}

/**
 * Camera basis: +forward is into the scene (from eye toward target), +right, +up (screen Y is −up in canvas).
 */
function lookAtBasis(eye: Vec3, lookTarget: Vec3): { forward: Vec3; right: Vec3; up: Vec3 } {
  const f = norm3(sub3(lookTarget, eye));
  const wUp: Vec3 = { x: 0, y: 1, z: 0 };
  let r = cross3(wUp, f);
  if (len3(r) < 1e-4) {
    r = { x: 1, y: 0, z: 0 };
  } else {
    r = norm3(r);
  }
  const u = norm3(cross3(f, r));
  return { forward: f, right: r, up: u };
}

function bezierPoint(
  t: number, x0: number, y0: number, cx: number, cy: number, x1: number, y1: number,
): { x: number; y: number } {
  const u = 1 - t;
  return { x: u*u*x0 + 2*u*t*cx + t*t*x1, y: u*u*y0 + 2*u*t*cy + t*t*y1 };
}

function project3D(
  x: number, y: number, z: number, cam: Camera, W: number, H: number,
): { px: number; py: number; sc: number; depth: number } {
  const p: Vec3 = { x, y, z };
  const eye = orbitEyePosition(cam);
  const { forward, right, up } = lookAtBasis(eye, cam.target);
  const v = sub3(p, eye);
  const zC = dot3(v, forward);
  if (zC < Z_MIN) {
    return { px: Number.NaN, py: Number.NaN, sc: 0, depth: zC };
  }
  const xC = dot3(v, right);
  const yC = dot3(v, up);
  const px = W / 2 + (PERSP_FOCAL * xC) / zC;
  const py = H / 2 - (PERSP_FOCAL * yC) / zC;
  const sc = PERSP_FOCAL / zC;
  if (!Number.isFinite(sc) || sc <= 0) {
    return { px: Number.NaN, py: Number.NaN, sc: 0, depth: zC };
  }
  return { px, py, sc, depth: zC };
}

// ── Graph builder ────────────────────────────────────────────────────────────

function jitter(v: number, r: number) { return v + (Math.random() - 0.5) * r; }

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/**
 * Distribute N siblings on a 3D disk so they never start at the same (x,y,z) — key for same cluster / same type.
 */
function vogelOffset3d(i: number, n: number, scale: number): { ox: number; oy: number; oz: number } {
  if (n <= 1) return { ox: 0, oy: 0, oz: 0 };
  const t = i * GOLDEN;
  const r = scale * (0.2 + Math.sqrt((i + 0.4) / n) * 4.5);
  return {
    ox: r * Math.cos(t),
    oy: r * Math.sin(t) * 0.8,
    oz: r * 0.5 * Math.sin(1.3 * t + i * 0.1),
  };
}

type GraphInputData = {
  semantics: SemanticMemoryV1[];
  rules: ProceduralRuleSummaryV1[];
  profileFacts: GraphProfileFact[];
  relationships: GraphRelationship[];
};

type GraphProfileFact = {
  id: number;
  key: string;
  value: string;
  confidence: number;
  status: string;
};

type GraphRelationship = {
  id: number;
  sourceId: number;
  targetId: number;
  type: string;
  label: string;
};

const SEMANTIC_CLUSTERS: Record<string, { cx: number; cy: number; cz: number }> = {
  learning:       { cx: -320, cy: -180, cz: -200 },
  workflow:       { cx:  320, cy: -100, cz:  160 },
  recommendation: { cx:  340, cy:  200, cz:  200 },
  profile:        { cx: -320, cy:  200, cz: -100 },
};

const PROFILE_MEM_CLUSTER  = { cx: -300, cy: 220, cz: -40 };

/**
 * API domain casing varies; unknown domains used to all fall through to (0,0,0) and stack.
 */
function clusterForSemanticDomain(domain: string | null | undefined): { cx: number; cy: number; cz: number } {
  const d = (domain ?? "").trim().toLowerCase().replace(/\s+/g, "_");
  if (d && SEMANTIC_CLUSTERS[d]) return SEMANTIC_CLUSTERS[d];
  const hit = Object.keys(SEMANTIC_CLUSTERS).find((k) => k === d || k.startsWith(d) || d.startsWith(k));
  if (hit) return SEMANTIC_CLUSTERS[hit]!;
  const idish = d.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const t = (idish * 0.0175);
  return { cx: 240 * Math.cos(t), cy: 160 * Math.sin(1.3 * t), cz: -200 * Math.sin(0.7 * t) };
}

/** Stable domain key used for grouping semantics and attaching procedural nodes. */
function normalizeDomainKey(domain: string | null | undefined): string {
  const d = (domain ?? "").trim().toLowerCase().replace(/\s+/g, "_");
  if (d && SEMANTIC_CLUSTERS[d]) return d;
  const hit = Object.keys(SEMANTIC_CLUSTERS).find((k) => k === d || k.startsWith(d) || d.startsWith(k));
  if (hit) return hit;
  return d || "other";
}

/** Map workflow kind to the semantic-domain bucket used for placement near related memories. */
function workflowTypeToDomainKey(workflowType: string | null | undefined): string {
  const w = (workflowType ?? "").trim().toLowerCase();
  if (!w) return "workflow";
  if (w.includes("news") || w === "recommendation") return "recommendation";
  if (w.includes("learn") || w.includes("side-learn")) return "learning";
  if (w.includes("insight")) return "workflow";
  if (w.includes("recommend")) return "recommendation";
  return "workflow";
}

function semanticIndexById(semantics: SemanticMemoryV1[]): Map<number, number> {
  const m = new Map<number, number>();
  semantics.forEach((s, i) => { m.set(s.id, i); });
  return m;
}

/** Undirected unique edges between semantic indices from relationship rows. */
function relationshipSemanticEdges(
  semantics: SemanticMemoryV1[],
  relationships: GraphRelationship[],
): [number, number][] {
  const idToIdx = semanticIndexById(semantics);
  const seen = new Set<string>();
  const out: [number, number][] = [];
  for (const rel of relationships) {
    const a = idToIdx.get(rel.sourceId);
    const b = idToIdx.get(rel.targetId);
    if (a === undefined || b === undefined || a === b) continue;
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const key = `${lo},${hi}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push([lo, hi]);
  }
  return out;
}

function connectedComponents(n: number, edges: [number, number][]): number[][] {
  const parent = Array.from({ length: n }, (_, i) => i);
  function find(x: number): number {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }
  function union(a: number, b: number) {
    parent[find(a)] = find(b);
  }
  for (const [a, b] of edges) union(a, b);
  const groups = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const r = find(i);
    if (!groups.has(r)) groups.set(r, []);
    groups.get(r)!.push(i);
  }
  return [...groups.values()].sort((a, b) => b.length - a.length);
}

/**
 * Fruchterman–Reingold in **2D** (relation-first layout on the xy plane).
 * Chains and trees in 3D often collapse to a “noodle” filament; 2D + a Vogel disk init
 * gives branchy clusters; we assign z and run a secondary pass separately.
 */
function fruchtermanReingold2d(
  n: number,
  edgePairs: [number, number][],
  iterations: number,
): Float64Array {
  const pos = new Float64Array(n * 2);
  for (let i = 0; i < n; i++) {
    const t = i * GOLDEN;
    const rad = 120 * Math.sqrt((i + 0.45) / Math.max(1, n)) * 2.2;
    pos[i * 2] = rad * Math.cos(t);
    pos[i * 2 + 1] = rad * Math.sin(t) * 0.92;
  }
  const area = Math.max(20000, 150 * 150 * Math.max(1, n));
  const k = Math.sqrt(area / Math.max(1, n));
  const disp = new Float64Array(n * 2);
  const temp0 = 100;
  const temp1 = 1.2;

  for (let it = 0; it < iterations; it++) {
    const t = temp0 + (temp1 - temp0) * (it / Math.max(1, iterations - 1));
    disp.fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let dx = pos[j * 2] - pos[i * 2];
        let dy = pos[j * 2 + 1] - pos[i * 2 + 1];
        let d2 = dx * dx + dy * dy;
        if (d2 < 1e-6) {
          const h = (i * 31 + j * 17) % 360;
          const ang = (h * Math.PI) / 180;
          dx = Math.cos(ang);
          dy = Math.sin(ang);
          d2 = dx * dx + dy * dy;
        }
        const d = Math.sqrt(d2) || 1e-6;
        const f = (k * k) / d;
        const rx = (dx / d) * f;
        const ry = (dy / d) * f;
        disp[i * 2] -= rx; disp[i * 2 + 1] -= ry;
        disp[j * 2] += rx; disp[j * 2 + 1] += ry;
      }
    }
    for (const [u, v] of edgePairs) {
      const dx = pos[v * 2] - pos[u * 2];
      const dy = pos[v * 2 + 1] - pos[u * 2 + 1];
      const d = Math.sqrt(dx * dx + dy * dy) || 1e-6;
      const f = (d * d) / k;
      const ax = (dx / d) * f;
      const ay = (dy / d) * f;
      disp[u * 2] += ax; disp[u * 2 + 1] += ay;
      disp[v * 2] -= ax; disp[v * 2 + 1] -= ay;
    }
    for (let i = 0; i < n; i++) {
      let m = Math.hypot(disp[i * 2], disp[i * 2 + 1]);
      if (m < 1e-8) continue;
      m = Math.min(m, t) / m;
      pos[i * 2] += disp[i * 2] * m * 0.88;
      pos[i * 2 + 1] += disp[i * 2 + 1] * m * 0.88;
    }
  }
  return pos;
}

/**
 * Secondary pass: nudge each semantic node toward the mean of its **domain** (semantic grouping).
 * Runs *after* relation-based FR; weak steps so we don’t tear the edge structure apart.
 */
function secondaryDomainClusterRelaxation(semNodes: GraphNode[], semantics: SemanticMemoryV1[], steps: number) {
  for (let step = 0; step < steps; step++) {
    const acc = new Map<string, { x: number; y: number; z: number; c: number }>();
    semantics.forEach((sem, i) => {
      const k0 = normalizeDomainKey(sem.domain);
      const a = acc.get(k0) ?? { x: 0, y: 0, z: 0, c: 0 };
      a.x += semNodes[i].x; a.y += semNodes[i].y; a.z += semNodes[i].z; a.c += 1;
      acc.set(k0, a);
    });
    const cent = new Map<string, Vec3>();
    acc.forEach((a, k0) => {
      if (a.c > 0) cent.set(k0, { x: a.x / a.c, y: a.y / a.c, z: a.z / a.c });
    });
    const alpha = 0.14 + 0.08 * ((steps - 1 - step) / Math.max(1, steps));
    semantics.forEach((sem, i) => {
      const c = cent.get(normalizeDomainKey(sem.domain));
      if (!c) return;
      semNodes[i].x += (c.x - semNodes[i].x) * alpha;
      semNodes[i].y += (c.y - semNodes[i].y) * alpha;
      semNodes[i].z += (c.z - semNodes[i].z) * alpha;
    });
  }
}

/** If the xy cloud is almost 1D (a “noodle”), spread along the short principal axis. */
function unflattenNoodleLayout(semNodes: GraphNode[], semantics: SemanticMemoryV1[]) {
  const n = semNodes.length;
  if (n < 4) return;
  let mx = 0, my = 0;
  for (let i = 0; i < n; i++) { mx += semNodes[i].x; my += semNodes[i].y; }
  mx /= n; my /= n;
  let cxx = 0, cxy = 0, cyy = 0;
  for (let i = 0; i < n; i++) {
    const dx = semNodes[i].x - mx;
    const dy = semNodes[i].y - my;
    cxx += dx * dx; cxy += dx * dy; cyy += dy * dy;
  }
  cxx /= n; cxy /= n; cyy /= n;
  const tr = cxx + cyy;
  const det = cxx * cyy - cxy * cxy;
  const disc = Math.max(0, (tr * tr) / 4 - det);
  const lam1 = tr / 2 + Math.sqrt(disc);
  const lam2 = tr / 2 - Math.sqrt(disc);
  if (lam2 < 1e-4) return;
  if (lam1 / lam2 < 6) return;
  let v2x = cxy;
  let v2y = lam1 - cxx;
  if (Math.abs(v2x) + Math.abs(v2y) < 1e-8) { v2x = lam1 - cyy; v2y = cxy; }
  const len = Math.hypot(v2x, v2y) || 1e-6;
  v2x /= len; v2y /= len;
  const scale = 92;
  semantics.forEach((_, i) => {
    const t = (i * 2.7 + n * 0.13) % 6.28;
    const off = scale * ((i % 3) - 1) * 0.35 + 40 * Math.sin(t);
    semNodes[i].x += v2x * off;
    semNodes[i].y += v2y * off;
  });
}

/**
 * 1) **Relations first**: connected components of the semantic relationship graph; place each on a ring if more than one.
 * 2) **Fruchterman–Reingold 2D** on edges in that component (avoids 3D “noodle” line collapse).
 * 3) **Secondary**: domain centroids (soft), then unflatten if the cloud is still too 1D.
 */
function layoutSemanticSubgraph(semNodes: GraphNode[], semantics: SemanticMemoryV1[], rels: GraphRelationship[]) {
  const n = semNodes.length;
  if (n === 0) return;
  const edgeIdx = relationshipSemanticEdges(semantics, rels);
  const components = connectedComponents(n, edgeIdx);
  const nComp = components.length;
  const useRing = nComp > 1;
  const slotR = 520;
  for (let ci = 0; ci < nComp; ci++) {
    const comp = components[ci];
    const m = comp.length;
    if (m === 0) continue;
    const loc = new Map<number, number>();
    comp.forEach((g, j) => { loc.set(g, j); });
    const sub: [number, number][] = [];
    for (const [a, b] of edgeIdx) {
      const la = loc.get(a);
      const lb = loc.get(b);
      if (la === undefined || lb === undefined) continue;
      sub.push([la, lb]);
    }
    const iters = m < 4 ? 55 : m < 10 ? 90 : 120;
    const fr = fruchtermanReingold2d(m, sub, iters);
    let cx = 0, cy = 0;
    for (let j = 0; j < m; j++) {
      cx += fr[j * 2];
      cy += fr[j * 2 + 1];
    }
    cx /= m; cy /= m;
    let maxD = 1e-6;
    for (let j = 0; j < m; j++) {
      const x = fr[j * 2] - cx;
      const y = fr[j * 2 + 1] - cy;
      maxD = Math.max(maxD, Math.hypot(x, y));
    }
    const targetR = 135 + m * 9;
    const sc = targetR / maxD;
    const theta = useRing ? (2 * Math.PI * ci) / nComp : 0;
    const scx = useRing ? slotR * Math.cos(theta) : 0;
    const scy = useRing ? slotR * Math.sin(theta) : 0;
    const scz = useRing ? 70 * Math.sin(theta * 1.9) : 0;
    for (let j = 0; j < m; j++) {
      const g = comp[j];
      const dz = normalizeDomainKey(semantics[g].domain)
        .split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
      const z0 = 48 * Math.sin((dz * Math.PI) / 180) + 32 * Math.sin(j * 1.03 + g * 0.27);
      semNodes[g].x = (fr[j * 2] - cx) * sc + scx;
      semNodes[g].y = (fr[j * 2 + 1] - cy) * sc + scy;
      semNodes[g].z = z0 * 0.55 * sc + scz;
    }
  }
  secondaryDomainClusterRelaxation(semNodes, semantics, 8);
  unflattenNoodleLayout(semNodes, semantics);
}

function meanSemanticPositionByDomain(
  semantics: SemanticMemoryV1[],
  semNodes: GraphNode[],
): Map<string, Vec3> {
  const acc = new Map<string, { x: number; y: number; z: number; c: number }>();
  semantics.forEach((s, i) => {
    const k = normalizeDomainKey(s.domain);
    const a = acc.get(k) ?? { x: 0, y: 0, z: 0, c: 0 };
    a.x += semNodes[i].x;
    a.y += semNodes[i].y;
    a.z += semNodes[i].z;
    a.c += 1;
    acc.set(k, a);
  });
  const out = new Map<string, Vec3>();
  acc.forEach((a, k) => {
    if (a.c > 0) out.set(k, { x: a.x / a.c, y: a.y / a.c, z: a.z / a.c });
  });
  return out;
}

function buildGraph(data: GraphInputData): GraphState {
  const semNodes: GraphNode[] = data.semantics.map((s) => ({
    id: `s-${s.id}`,
    type: "semantic" as const,
    label: s.key.replace(/_/g, " "),
    r: 10 + (s.confidence ?? 0.5) * 11,
    data: s,
    x: 0, y: 0, z: 0,
    vx: 0, vy: 0, vz: 0,
  }));
  layoutSemanticSubgraph(semNodes, data.semantics, data.relationships);
  const domainCenter = meanSemanticPositionByDomain(data.semantics, semNodes);
  const pick = (key: string): Vec3 => {
    const c = domainCenter.get(key);
    if (c) return { ...c };
    const b = clusterForSemanticDomain(key);
    return { x: b.cx, y: b.cy, z: b.cz };
  };
  const nodes: GraphNode[] = [...semNodes];
  const nR = data.rules.length;
  data.rules.forEach((r, idx) => {
    const k = workflowTypeToDomainKey(r.workflowType);
    const center = pick(k);
    const sp = vogelOffset3d(idx, Math.max(1, nR), 36);
    const spread = 0.55;
    nodes.push({
      id: `r-${r.id}`,
      type: "procedural",
      label: r.ruleName.replace(/-/g, " "),
      r: 11 + (r.priority / 10) * 8,
      data: r,
      x: center.x + sp.ox * spread + jitter(0, 20),
      y: center.y + sp.oy * spread + jitter(0, 18),
      z: center.z + sp.oz * spread + jitter(0, 20),
      vx: 0, vy: 0, vz: 0,
    });
  });
  const nP = data.profileFacts.length;
  const profCenter = domainCenter.get("profile") ?? {
    x: PROFILE_MEM_CLUSTER.cx,
    y: PROFILE_MEM_CLUSTER.cy,
    z: PROFILE_MEM_CLUSTER.cz,
  };
  data.profileFacts.forEach((p, idx) => {
    const sp = vogelOffset3d(idx, Math.max(1, nP), 44);
    const spread = 0.5;
    nodes.push({
      id: `p-${p.id}`,
      type: "profile",
      label: p.key.replace(/_/g, " "),
      r: 12,
      data: p,
      x: profCenter.x + sp.ox * spread + jitter(0, 18),
      y: profCenter.y + sp.oy * spread + jitter(0, 16),
      z: profCenter.z + sp.oz * spread + jitter(0, 18),
      vx: 0, vy: 0, vz: 0,
    });
  });
  const idMap: Record<string, GraphNode> = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const edges: GraphEdge[] = data.relationships
    .map((rel) => ({
      src: `s-${rel.sourceId}`,
      tgt: `s-${rel.targetId}`,
      label: rel.type,
      particles: Array.from({ length: 2 }, (_, i) => ({
        t: i * 0.5 + Math.random() * 0.3,
        speed: 0.0012 + Math.random() * 0.0018,
      })),
    }))
    .filter((e) => idMap[e.src] && idMap[e.tgt]);
  let edgeRest = 400;
  let nLen = 0, sum = 0;
  for (const e of edges) {
    const a = idMap[e.src], b = idMap[e.tgt];
    if (!a || !b) continue;
    sum += Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
    nLen++;
  }
  if (nLen > 0) {
    edgeRest = Math.max(200, Math.min(900, (sum / nLen) * 1.02));
  }
  enforceMinNodeSeparation(nodes);
  return { nodes, edges, idMap, edgeRest };
}

/** Ensure no two nodes share the same (or nearly same) position; stable layout after initial physics. */
const MIN_NODE_GAP = 16;

function enforceMinNodeSeparation(nodes: GraphNode[], iterations = 14) {
  for (let it = 0; it < iterations; it++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dz = b.z - a.z;
        let d = Math.hypot(dx, dy, dz);
        const need = a.r + b.r + MIN_NODE_GAP;
        if (d < 1e-4) {
          const h = ((i * 137 + j * 89) % 360) * (Math.PI / 180);
          const h2 = h * 1.7;
          dx = Math.cos(h) * Math.cos(h2);
          dy = Math.sin(h2);
          dz = Math.sin(h) * Math.cos(h2);
          d = 1;
        }
        if (d < need) {
          const push = (need - d) * 0.51;
          const nx = dx / d;
          const ny = dy / d;
          const nz = dz / d;
          a.x -= nx * push;
          a.y -= ny * push;
          a.z -= nz * push;
          b.x += nx * push;
          b.y += ny * push;
          b.z += nz * push;
        }
      }
    }
  }
}

// ── Physics ──────────────────────────────────────────────────────────────────

// Repulsion uses k(zoom). Edge rest length comes from the laid-out graph (see `buildGraph` `edgeRest`).
const K0 = 420;

function runPhysics(state: GraphState, zoomBoost: number) {
  const { nodes, edges, idMap, edgeRest } = state;
  const rest = edgeRest;
  const k = K0 * (1 + Math.max(0, zoomBoost - 0.9) * 3.5);

  nodes.forEach((n) => { n.fx = 0; n.fy = 0; n.fz = 0; });

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, dz = nodes[i].z - nodes[j].z;
      const d = Math.sqrt(dx*dx + dy*dy + dz*dz) || 0.1;
      const minD = nodes[i].r + nodes[j].r + 110;
      const f = d < minD ? (minD - d) * 2.0 : (k*k*k) / (d*d*d) * k;
      nodes[i].fx! += (dx/d)*f; nodes[i].fy! += (dy/d)*f; nodes[i].fz! += (dz/d)*f;
      nodes[j].fx! -= (dx/d)*f; nodes[j].fy! -= (dy/d)*f; nodes[j].fz! -= (dz/d)*f;
    }
    const grav = 0.003 / (1 + Math.max(0, zoomBoost - 1) * 2);
    nodes[i].fx! -= nodes[i].x * grav;
    nodes[i].fy! -= nodes[i].y * grav;
    nodes[i].fz! -= nodes[i].z * grav;
  }

  edges.forEach((e) => {
    const a = idMap[e.src], b = idMap[e.tgt]; if (!a || !b) return;
    const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
    const d = Math.sqrt(dx*dx + dy*dy + dz*dz) || 0.1;
    const f = (d - rest) * 0.010;
    a.fx! += (dx/d)*f; a.fy! += (dy/d)*f; a.fz! += (dz/d)*f;
    b.fx! -= (dx/d)*f; b.fy! -= (dy/d)*f; b.fz! -= (dz/d)*f;
  });
}

// ── Component ────────────────────────────────────────────────────────────────

type SelectedNode = GraphNode & { _px: number; _py: number; _pr: number };

type MemoryGraphCanvasProps = {
  data: GraphInputData;
};

function MemoryGraphCanvas({ data }: MemoryGraphCanvasProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef     = useRef<GraphState | null>(null);
  const frameRef     = useRef<number>(0);
  const tickRef      = useRef(0);
  const dprRef       = useRef(1);
  const camRef         = useRef<Camera>({
    target: { x: 0, y: 0, z: 0 },
    yaw: 0.42,
    pitch: -0.28,
    distance: 2200,
  });
  const dragRef      = useRef({ active: false, button: 0, lx: 0, ly: 0, moved: false });
  const selectedRef  = useRef<GraphNode | null>(null);
  const hoveredRef   = useRef<GraphNode | null>(null);

  const [selected, setSelected] = useState<SelectedNode | null>(null);

  const DEFAULT_CAM: Camera = {
    target: { x: 0, y: 0, z: 0 },
    yaw: 0.42,
    pitch: -0.28,
    distance: 2200,
  };

  useEffect(() => {
    const canvas = canvasRef.current, container = containerRef.current;
    if (!canvas || !container) return;
    tickRef.current = 0;
    stateRef.current = buildGraph(data);

    function resize() {
      const dpr = window.devicePixelRatio || 1; dprRef.current = dpr;
      const rect = container!.getBoundingClientRect();
      canvas!.width  = rect.width  * dpr;
      canvas!.height = rect.height * dpr;
      canvas!.style.width  = rect.width  + "px";
      canvas!.style.height = rect.height + "px";
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    function tick() {
      const gs = stateRef.current!;
      const { nodes, edges } = gs;
      const t = tickRef.current;

      if (t < 360) {
        runPhysics(gs, 1);
        const damp = t < 120 ? 0.74 : t < 250 ? 0.82 : 0.90;
        nodes.forEach((n) => {
          n.vx = (n.vx + n.fx!) * damp;
          n.vy = (n.vy + n.fy!) * damp;
          n.vz = (n.vz + n.fz!) * damp;
          n.x += n.vx; n.y += n.vy; n.z += n.vz;
          const pad = 500;
          n.x = Math.max(-pad, Math.min(pad, n.x));
          n.y = Math.max(-pad, Math.min(pad, n.y));
          n.z = Math.max(-pad, Math.min(pad, n.z));
        });
        if (t === 359) {
          nodes.forEach((n) => { n.vx = 0; n.vy = 0; n.vz = 0; n.rx = n.x; n.ry = n.y; n.rz = n.z; });
          /** Final pass: camera moves must not re-run physics; keep nodes strictly separated. */
          enforceMinNodeSeparation(nodes, 10);
        }
      } else {
        nodes.forEach((n) => { n.vx = 0; n.vy = 0; n.vz = 0; n.rx = n.x; n.ry = n.y; n.rz = n.z; });
      }

      edges.forEach((e) => { e.particles.forEach((p) => { p.t += p.speed; if (p.t > 1) p.t -= 1; }); });
      tickRef.current++;
    }

    function draw() {
      const ctx  = canvas!.getContext("2d")!;
      const dpr  = dprRef.current;
      const W    = canvas!.width  / dpr;
      const H    = canvas!.height / dpr;
      const cam  = camRef.current;
      const gs   = stateRef.current!;
      ctx.save(); ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#080c10"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(0,212,255,0.05)"; ctx.lineWidth = 0.5;
      for (let gx = 0; gx < W; gx += 42) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
      for (let gy = 0; gy < H; gy += 42) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

      const { nodes, edges, idMap } = gs;
      const hovId = hoveredRef.current?.id ?? null;
      const selId = selectedRef.current?.id ?? null;

      const proj: Record<string, ReturnType<typeof project3D>> = {};
      nodes.forEach((n) => { proj[n.id] = project3D(n.x, n.y, n.z, cam, W, H); });
      // Larger depth = farther along view; draw far nodes first, near on top.
      const sorted = [...nodes].sort((a, b) => proj[b.id].depth - proj[a.id].depth);

      // Edges
      edges.forEach((e) => {
        const a = idMap[e.src], b = idMap[e.tgt]; if (!a || !b) return;
        const pa = proj[a.id], pb = proj[b.id];
        if (pa.sc < 0.01 || pb.sc < 0.01) return;
        if (!Number.isFinite(pa.px) || !Number.isFinite(pb.px)) return;
        const isHi = a.id === hovId || b.id === hovId || a.id === selId || b.id === selId;
        const col  = NODE_COLORS[a.type];
        const cpx  = (pa.px + pb.px) / 2 + (pb.py - pa.py) * 0.2;
        const cpy  = (pa.py + pb.py) / 2 - (pb.px - pa.px) * 0.2;
        const midSc = Math.max(0.1, (pa.sc + pb.sc) * 0.5);
        ctx.beginPath(); ctx.moveTo(pa.px, pa.py); ctx.quadraticCurveTo(cpx, cpy, pb.px, pb.py);
        ctx.strokeStyle = isHi ? `rgba(${col.rgb},0.42)` : `rgba(${col.rgb},0.16)`;
        ctx.lineWidth = (isHi ? 1.8 : 0.8) * midSc; ctx.stroke();
        e.particles.forEach((p) => {
          const pt = bezierPoint(p.t, pa.px, pa.py, cpx, cpy, pb.px, pb.py);
          ctx.beginPath(); ctx.arc(pt.x, pt.y, (isHi ? 2.8 : 2) * midSc, 0, Math.PI*2);
          ctx.fillStyle = col.fill; ctx.shadowColor = col.fill; ctx.shadowBlur = isHi ? 8 : 4;
          ctx.fill(); ctx.shadowBlur = 0;
        });
      });

      // Nodes
      sorted.forEach((n) => {
        const p = proj[n.id];
        if (p.sc < 0.01 || !Number.isFinite(p.px) || !Number.isFinite(p.py)) {
          n._px = -1; n._py = -1; n._pr = 0;
          return;
        }
        const col   = NODE_COLORS[n.type];
        const isHov = n.id === hovId, isSel = n.id === selId;
        const r     = Math.max(0.5, n.r * p.sc * (isSel ? 1.3 : isHov ? 1.18 : 1));
        const alpha = Math.max(0.25, Math.min(1, 0.35 + Math.min(p.sc, 4)));

        const halo = ctx.createRadialGradient(p.px, p.py, r * 0.2, p.px, p.py, r + 18);
        halo.addColorStop(0, `rgba(${col.rgb},${(isSel?0.24:isHov?0.18:0.1)*alpha})`);
        halo.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(p.px, p.py, r+18, 0, Math.PI*2);
        ctx.fillStyle = halo; ctx.fill();

        ctx.beginPath(); ctx.arc(p.px, p.py, r, 0, Math.PI*2);
        ctx.fillStyle = col.bg; ctx.strokeStyle = col.fill;
        ctx.lineWidth = (isSel ? 2.5 : isHov ? 2 : 1.5) * p.sc;
        ctx.globalAlpha = alpha; ctx.fill();
        if (isSel) { ctx.shadowColor = col.fill; ctx.shadowBlur = 10; }
        ctx.stroke(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;

        if (r > 10) {
          const hw = r * 0.52;
          ctx.strokeStyle = col.fill; ctx.lineWidth = 1.2 * p.sc; ctx.globalAlpha = alpha * 0.7;
          [[p.px-hw, p.py-hw, 1, 1], [p.px+hw, p.py+hw, -1, -1]].forEach(([bx, by, sx, sy]) => {
            ctx.beginPath(); ctx.moveTo(bx+sx*r*0.28, by); ctx.lineTo(bx, by); ctx.lineTo(bx, by+sy*r*0.28); ctx.stroke();
          });
          ctx.globalAlpha = 1;
        }

        const glyph = n.type === "semantic" ? "S" : n.type === "procedural" ? "P" : "F";
        ctx.font = `bold ${Math.max(8, r*0.5)}px 'Space Mono',monospace`;
        ctx.fillStyle = col.fill; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.globalAlpha = alpha;
        ctx.fillText(glyph, p.px, p.py);
        ctx.textBaseline = "alphabetic"; ctx.globalAlpha = 1;

        const labelThreshold = 12;
        if ((isHov || isSel || r > labelThreshold) && p.sc > 0.45) {
          const fs = Math.max(8, Math.round(9 * Math.min(p.sc, 1.2)));
          ctx.font = `${isHov||isSel ? 700 : 400} ${fs}px 'Space Mono',monospace`;
          ctx.fillStyle = isHov||isSel ? col.fill : "rgba(90,122,138,0.82)";
          ctx.globalAlpha = alpha * (isHov||isSel ? 1 : 0.75);
          const lbl = n.label.length > 22 ? n.label.slice(0, 20) + "…" : n.label;
          ctx.fillText(lbl.toUpperCase(), p.px, p.py + r + 12 * p.sc);
          ctx.globalAlpha = 1;
        }
        n._px = p.px; n._py = p.py; n._pr = r;
      });

      // Tooltip
      if (hoveredRef.current) {
        const n = hoveredRef.current, col = NODE_COLORS[n.type];
        if (n._px == null || n._py == null || (n._pr ?? 0) < 0.1) {
          // culled or invalid — skip
        } else {
        const tx = Math.min((n._px ?? 0) + 16, W - 180);
        const ty = Math.max((n._py ?? 0) - 48, 8);
        ctx.fillStyle = "rgba(14,21,32,0.98)"; ctx.strokeStyle = "rgba(0,212,255,0.18)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.rect(tx, ty, 172, 40); ctx.fill(); ctx.stroke();
        ctx.font = "bold 9px 'Orbitron',sans-serif"; ctx.fillStyle = col.fill; ctx.textAlign = "left";
        ctx.fillText(TYPE_LABELS[n.type].toUpperCase(), tx+10, ty+16);
        ctx.font = "8px 'Space Mono',monospace"; ctx.fillStyle = "rgba(90,122,138,0.9)";
        const lbl = n.label.length > 26 ? n.label.slice(0, 24) + "…" : n.label;
        ctx.fillText(lbl, tx+10, ty+30);
        }
      }

      if (tickRef.current < 80) {
        ctx.font = "8px 'Space Mono',monospace"; ctx.fillStyle = "rgba(90,122,138,0.75)"; ctx.textAlign = "center";
        ctx.fillText("DRAG: ORBIT  ·  SHIFT / RMB: PAN  ·  SCROLL: DOLLY (MOVE IN/OUT)", W/2, H-14);
      }
      ctx.font = "8px 'Space Mono',monospace"; ctx.fillStyle = "rgba(90,122,138,0.75)"; ctx.textAlign = "right";
      ctx.fillText(`DOLLY ${Math.round(cam.distance)}u`, W-16, H-14);

      ctx.restore();
    }

    function loop() { tick(); draw(); frameRef.current = requestAnimationFrame(loop); }
    frameRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(frameRef.current); ro.disconnect(); };
  }, [data]);

  // Non-passive wheel so the shell scroll area does not steal zoom.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const cam = camRef.current;
      const factor = e.deltaY > 0 ? 1.08 : 1 / 1.08;
      cam.distance = Math.max(300, Math.min(12000, cam.distance * factor));
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => { canvas.removeEventListener("wheel", onWheel); };
  }, []);

  // End drags that end outside the canvas.
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

  function getNodeAt(ex: number, ey: number): GraphNode | null {
    const canvas = canvasRef.current; if (!canvas || !stateRef.current) return null;
    const rect = canvas.getBoundingClientRect();
    const mx = ex - rect.left, my = ey - rect.top;
    let closest: GraphNode | null = null, closestD = Infinity;
    stateRef.current.nodes.forEach((n) => {
      if (n._px == null || n._py == null || n._pr == null || n._pr < 0.1 || n._px < 0) return;
      const d = Math.sqrt((mx - n._px)**2 + (my - n._py)**2);
      if (d < n._pr + 8 && d < closestD) { closestD = d; closest = n; }
    });
    return closest;
  }

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    e.preventDefault();
    if (e.button > 2) return;
    dragRef.current = { active: true, button: e.button, lx: e.clientX, ly: e.clientY, moved: false };
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (drag.active) {
      const dx = e.clientX - drag.lx, dy = e.clientY - drag.ly;
      drag.moved = true;
      // Same as memory-graph.jsx: orbit with primary drag; pan with RMB or Shift+drag (3D view).
      const pan = drag.button === 2 || e.shiftKey;
      const c = camRef.current;
      if (pan) {
        const eye = orbitEyePosition(c);
        const { right, up } = lookAtBasis(eye, c.target);
        const s = 0.35 * (c.distance / 2200);
        c.target = add3(c.target, add3(scale3(-dx * s, right), scale3(dy * s, up)));
      } else {
        c.yaw += dx * 0.006;
        c.pitch += dy * 0.006;
        c.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, c.pitch));
      }
      drag.lx = e.clientX; drag.ly = e.clientY;
      hoveredRef.current = null;
      canvasRef.current!.style.cursor = "grabbing";
    } else {
      hoveredRef.current = getNodeAt(e.clientX, e.clientY);
      canvasRef.current!.style.cursor = hoveredRef.current ? "pointer" : "grab";
    }
  }

  function onMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
    const drag = dragRef.current; drag.active = false;
    canvasRef.current!.style.cursor = "grab";
    if (!drag.moved) {
      const n = getNodeAt(e.clientX, e.clientY);
      const next = (n && selectedRef.current?.id === n.id) ? null : n;
      selectedRef.current = next;
      setSelected(next as SelectedNode | null);
    }
  }

  const col = selected ? NODE_COLORS[selected.type] : null;

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div ref={containerRef} style={{ flex: 1, position: "relative", minWidth: 0, cursor: "grab" }}>
        <canvas
          ref={canvasRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onContextMenu={(e) => e.preventDefault()}
          style={{ display: "block", width: "100%", height: "100%" }}
        />

        <div className={styles.graphLegend}>
          {(Object.entries(NODE_COLORS) as [NodeType, typeof NODE_COLORS[NodeType]][]).map(([type, c]) => (
            <div key={type} className={styles.graphLegendItem}>
              <div className={styles.graphLegendDot} style={{ background: c.fill, boxShadow: `0 0 6px ${c.fill}` }} />
              <span className={styles.graphLegendLabel}>{TYPE_LABELS[type]}</span>
            </div>
          ))}
        </div>

        <button
          className={styles.graphResetBtn}
          onClick={() => { camRef.current = { ...DEFAULT_CAM }; }}
        >
          Reset view
        </button>
      </div>

      {selected && col && (
        <div className={styles.nodeDetailPanel}>
          <div style={{ position: "absolute", top: -1, left: -1, width: 10, height: 10, borderTop: `1.5px solid ${col.fill}`, borderLeft: `1.5px solid ${col.fill}` }} />
          <div style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderBottom: `1.5px solid ${col.fill}`, borderRight: `1.5px solid ${col.fill}` }} />

          <div className={styles.nodeDetailHeader}>
            <span className={styles.nodeDetailType} style={{ color: col.fill }}>
              {TYPE_LABELS[selected.type]}
            </span>
            <button
              className={styles.nodeDetailClose}
              onClick={() => { selectedRef.current = null; setSelected(null); }}
            >
              ✕
            </button>
          </div>

          <div>
            <div className={styles.nodeDetailKey}>
              {(selected.data.key ?? selected.data.ruleName ?? "—").replace(/_/g, " ")}
            </div>
            {selected.data.claim && <p className={styles.nodeDetailClaim}>{selected.data.claim}</p>}
            {selected.data.ruleContent && <p className={styles.nodeDetailClaim}>{selected.data.ruleContent}</p>}
            {selected.data.value && (
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text)" }}>
                {selected.data.value}
              </div>
            )}
          </div>

          {selected.data.confidence != null && (
            <div>
              <div className={styles.nodeDetailBarMeta}>
                <span className={styles.nodeDetailBarLabel}>Confidence</span>
                <span className={styles.nodeDetailBarValue} style={{ color: col.fill }}>
                  {Math.round(selected.data.confidence * 100)}%
                </span>
              </div>
              <div className={styles.barTrackSlim} style={{ height: 2 }}>
                <div style={{ height: "100%", width: `${selected.data.confidence * 100}%`, background: col.fill, boxShadow: `0 0 8px ${col.glow}` }} />
              </div>
            </div>
          )}

          {selected.data.authorityWeight != null && (
            <div>
              <div className={styles.nodeDetailBarMeta}>
                <span className={styles.nodeDetailBarLabel}>Authority</span>
                <span className={styles.nodeDetailBarValue} style={{ color: "var(--color-text-muted)" }}>
                  {Math.round(selected.data.authorityWeight * 100)}%
                </span>
              </div>
              <div className={styles.barTrackSlim} style={{ height: 2 }}>
                <div style={{ height: "100%", width: `${selected.data.authorityWeight * 100}%`, background: "rgba(160,156,142,0.5)" }} />
              </div>
            </div>
          )}

          <div className={styles.nodeDetailTags}>
            {selected.data.domain && (
              <JarvisTag label={selected.data.domain} color={col.fill} />
            )}
            {selected.data.status && (
              <JarvisTag
                label={selected.data.status}
                color={selected.data.status === "Active" ? "#79a88b" : "#b58a49"}
              />
            )}
            {selected.data.evidenceCount != null && (
              <JarvisTag label={`${selected.data.evidenceCount} ev`} />
            )}
            {selected.data.version != null && (
              <JarvisTag label={`v${selected.data.version}`} />
            )}
          </div>

          {selected.type === "semantic" && (
            <div className={styles.nodeDetailActions}>
              <NodeAction label="Archive" variant="danger" nodeId={selected.data.id} action={archiveSemantic} onDone={() => { selectedRef.current = null; setSelected(null); }} />
              <NodeAction label="Reject" variant="warn" nodeId={selected.data.id} action={rejectSemantic} onDone={() => { selectedRef.current = null; setSelected(null); }} />
            </div>
          )}
          {selected.type === "procedural" && (
            <div className={styles.nodeDetailActions}>
              <NodeAction label="Deprecate" variant="danger" nodeId={selected.data.id} action={deprecateProceduralRule} onDone={() => { selectedRef.current = null; setSelected(null); }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function rejectSemantic(id: number) {
  return import("@/lib/api/adapters/memory-center").then((m) => m.rejectSemantic(id, CURRENT_USER_ID));
}

type NodeActionProps = {
  label: string;
  variant: "danger" | "warn";
  nodeId: number;
  action: (id: number) => Promise<void>;
  onDone: () => void;
};

function NodeAction({ label, variant, nodeId, action, onDone }: NodeActionProps) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const cls = variant === "danger" ? styles.btnDanger : styles.btnWarn;

  const run = async () => {
    setBusy(true); setErr(null);
    try { await action(nodeId); onDone(); }
    catch (e) { setErr(formatLoadError(e)); }
    finally { setBusy(false); }
  };

  return (
    <>
      {err && <span style={{ fontSize: 9, color: "#ef4444", fontFamily: "var(--font-mono)" }}>{err}</span>}
      <button className={cls} disabled={busy} onClick={() => void run()}>
        {busy ? "…" : label}
      </button>
    </>
  );
}

// ── Data loader wrapper ───────────────────────────────────────────────────────

type GraphDataBundle = {
  semantics: SemanticMemoryV1[];
  rules: ProceduralRuleSummaryV1[];
  profile: ProfileMemoryV1;
};

async function loadGraphData(): Promise<GraphDataBundle> {
  const [semantics, rules, profile] = await Promise.all([
    fetchSemantics(CURRENT_USER_ID, true),
    fetchProceduralRules(CURRENT_USER_ID),
    fetchExplicitProfile(CURRENT_USER_ID),
  ]);
  return { semantics, rules, profile };
}

function profileToFacts(profile: ProfileMemoryV1): GraphProfileFact[] {
  const facts: GraphProfileFact[] = [];
  if (profile.coreInterests?.length) {
    facts.push({ id: 100, key: "core_interests", value: profile.coreInterests.join(", "), confidence: 1.0, status: "Active" });
  }
  if (profile.goals?.length) {
    facts.push({ id: 101, key: "goals", value: profile.goals.slice(0, 2).join(", "), confidence: 1.0, status: "Active" });
  }
  return facts;
}

export function MemoryGraphPanel() {
  const load = useCallback(() => loadGraphData(), []);
  const res = useAsyncResource(load, "graph-data");

  if (res.status === "loading") {
    return <p className={styles.loadingText}>Initialising memory network…</p>;
  }
  if (res.status === "error") {
    return (
      <div className={styles.errorWrap}>
        <JarvisInlineError title="Memory graph unavailable" message={formatLoadError(res.error)} />
      </div>
    );
  }

  // TODO: replace MOCK_RELATIONSHIPS with GET /api/v1/memory/relationships when endpoint is available
  const graphData: GraphInputData = {
    semantics: res.data.semantics,
    rules: res.data.rules,
    profileFacts: profileToFacts(res.data.profile),
    relationships: MOCK_RELATIONSHIPS,
  };

  return (
    <div className={styles.canvasPanel}>
      <MemoryGraphCanvas data={graphData} />
    </div>
  );
}
