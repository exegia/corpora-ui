import { PILL_OFFSET } from "./constant";
import type { StepNode } from "./types";

/**
 * Rows → y offsets from measured node heights
 */
export const rows = (steps: StepNode[]) => [...new Set(steps.map((n) => n.row))].sort((a, b) => a - b);

/**
 * Heights of each row, computed from the maximum node height in each row.
 * 
 * @param steps The nodes in the chart. `StepNode[]`
 * @param heights The node heights. `Record<string, number>`
 */
export const rowH = (steps: StepNode[], heights: Record<string, number>) => rows(steps).map((r) =>
  Math.max(...steps.filter((n) => n.row === r).map((n) => heights[n.id] ?? 90)),
);

/**
 * Y offsets of each row, computed from the row heights.
 */
export const rowY: number[] = [];

/**
 * Canvas height, computed from the row heights and padding.
 */
export const canvasH = (rowY: number[], rowH: number[], PAD_Y: number) => rowY[rowY.length - 1] + rowH[rowH.length - 1] + PAD_Y;

export const mix = (hue: string, pct: number, base = "var(--surface)") =>
  `color-mix(in srgb, ${hue} ${pct}%, ${base})`;

export const cw = (width: number) => width || 480;

/**
 * Places a node on the canvas.
 * 
 * @param n The node to place. `StepNode`
 * @param width The width of the chart. `number`
 * @param offsets The offsets of the nodes. `Record<string, { dx: number; dy: number }>`
 * @param rows The row heights. `number[]`
 */
export const place = (n: StepNode, width: number, offsets: Record<string, { dx: number; dy: number }>, rows: number[]) => {
  const w = Math.min(n.w, cw(width) * 0.92);
  const off = offsets[n.id];
  return {
    w,
    cx: n.x * cw(width) + (off?.dx ?? 0),
    top: rowY[rows.indexOf(n.row)] + (off?.dy ?? 0),
  };
};

/**
 * Card anchor points (pills sit above the card, so offset the top)
 * 
 * @param n The node to anchor. `StepNode`
 * @param width The width of the chart. `number`
 * @param offsets The offsets of the nodes. `Record<string, { dx: number; dy: number }>`
 * @param rows The row heights. `number[]`
 * @param heights The node heights. `Record<string, number>`
 */
export const anchors = (n: StepNode, width: number, offsets: Record<string, { dx: number; dy: number }>, rows: number[], heights: Record<string, number>) => {
  const { cx, top } = place(n, width, offsets, rows);
  return {
    top: { x: cx, y: top + (n.kind ? PILL_OFFSET : 0) },
    bottom: { x: cx, y: top + (heights[n.id] ?? 90) },
  };
};

/**
 * Bezier curve for the edge between two nodes.
 * 
 * @param edge The edge to draw. `{ from: string; to: string }`
 * @param width The width of the chart. `number`
 * @param offsets The offsets of the nodes. `Record<string, { dx: number; dy: number }>`
 * @param steps The nodes in the chart. `StepNode[]`
 * @param rows The row heights. `number[]`
 * @param heights The node heights. `Record<string, number>`
 */
export const bezier = (edge: { from: string; to: string }, width: number, offsets: Record<string, { dx: number; dy: number }>, steps: StepNode[], rows: number[], heights: Record<string, number>) => {
  const from = anchors(steps.find((n) => n.id === edge.from)!, width, offsets, rows, heights).bottom;
  const to = anchors(steps.find((n) => n.id === edge.to)!, width, offsets, rows, heights).top;
  const k = Math.min(Math.max(Math.abs(to.y - from.y) * 0.55, 24), 84);
  return `M ${from.x} ${from.y} C ${from.x} ${from.y + k}, ${to.x} ${to.y - k}, ${to.x} ${to.y}`;
};