import { PAD_Y, PILL_OFFSET, ROW_GAP } from "./constant";
import type { StepNode } from "./types";

export type Offsets = Record<string, { dx: number; dy: number }>;
export type Heights = Record<string, number>;

/** Everything `place`/`bezier` need to position a node, resolved once per render. */
export type Layout = {
  width: number;
  offsets: Offsets;
  rows: number[];
  rowY: number[];
  heights: Heights;
};

/** Distinct row indices, ascending. */
export const rows = (steps: StepNode[]) =>
  [...new Set(steps.map((n) => n.row))].sort((a, b) => a - b);

/** Height of each row = tallest node in it. */
export const rowH = (steps: StepNode[], heights: Heights) =>
  rows(steps).map((r) =>
    Math.max(...steps.filter((n) => n.row === r).map((n) => heights[n.id] ?? 90)),
  );

/** Y offset of each row, stacked with ROW_GAP. */
export const rowYs = (rowH: number[]) =>
  rowH.map((_, i) => (i === 0 ? PAD_Y : PAD_Y + rowH.slice(0, i).reduce((a, b) => a + b, 0) + i * ROW_GAP));

export const canvasH = (rowY: number[], rowH: number[]) =>
  (rowY[rowY.length - 1] ?? PAD_Y) + (rowH[rowH.length - 1] ?? 0) + PAD_Y;

export const mix = (hue: string, pct: number, base = "var(--surface)") =>
  `color-mix(in srgb, ${hue} ${pct}%, ${base})`;

export const cw = (width: number) => width || 480;

export const place = (n: StepNode, { width, offsets, rows, rowY }: Layout) => {
  const w = Math.min(n.w, cw(width) * 0.92);
  const off = offsets[n.id];
  return {
    w,
    cx: n.x * cw(width) + (off?.dx ?? 0),
    top: (rowY[rows.indexOf(n.row)] ?? PAD_Y) + (off?.dy ?? 0),
  };
};

/** Card anchor points (pills sit above the card, so offset the top). */
export const anchors = (n: StepNode, layout: Layout) => {
  const { cx, top } = place(n, layout);
  return {
    top: { x: cx, y: top + (n.kind ? PILL_OFFSET : 0) },
    bottom: { x: cx, y: top + (layout.heights[n.id] ?? 90) },
  };
};

export type Point = { x: number; y: number };

/** Vertical S-curve between two points. */
export const curve = (from: Point, to: Point) => {
  const k = Math.min(Math.max(Math.abs(to.y - from.y) * 0.55, 24), 84);
  return `M ${from.x} ${from.y} C ${from.x} ${from.y + k}, ${to.x} ${to.y - k}, ${to.x} ${to.y}`;
};

/** Cubic bezier midpoint, where the connector toolbar sits. */
export const midpoint = (from: Point, to: Point): Point => ({ x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 });

export const edgePoints = (edge: { from: string; to: string }, steps: StepNode[], layout: Layout) => {
  const a = steps.find((n) => n.id === edge.from);
  const b = steps.find((n) => n.id === edge.to);
  if (!a || !b) return null;
  return { from: anchors(a, layout).bottom, to: anchors(b, layout).top };
};

export const bezier = (edge: { from: string; to: string }, steps: StepNode[], layout: Layout) => {
  const pts = edgePoints(edge, steps, layout);
  return pts ? curve(pts.from, pts.to) : "";
};
