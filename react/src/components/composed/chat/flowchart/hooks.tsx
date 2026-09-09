import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { Edge, FlowchartProps, StepNode } from "./types";
import { bezier, canvasH, cw, place, rowH, rows, rowYs, type Heights, type Layout, type Offsets } from "./utils";
import { EST_H } from "./constant";

export const ZOOM_MIN = 0.25;
export const ZOOM_MAX = 2;

type Options = Pick<FlowchartProps, "edges" | "readOnly" | "zoomable" | "onDrag" | "onAdd" | "onRemove"> & {
  steps: StepNode[];
};

/** Default connectors: a chain through the steps in order. */
export const chainEdges = (steps: StepNode[]): Edge[] =>
  steps.slice(1).map((n, i) => ({ id: `${steps[i].id}->${n.id}`, source: steps[i].id, target: n.id }));

export const useFlowchart = ({ steps, edges: edgesProp, readOnly = false, zoomable = false, onDrag, onAdd, onRemove }: Options) => {
  const [width, setWidth] = useState(0);
  const [heights, setHeights] = useState<Heights>(EST_H);
  const [selected, setSelected] = useState<string | null>(null);
  const [offsets, setOffsets] = useState<Offsets>({});
  const [scale, setScale] = useState(1);
  const drag = useRef<{
    id: string;
    startX: number;
    startY: number;
    baseDx: number;
    baseDy: number;
    moved: boolean;
  } | null>(null);

  const edges = useMemo(() => edgesProp ?? chainEdges(steps), [edgesProp, steps]);
  const rowHeight = useMemo(() => rowH(steps, heights), [heights, steps]);
  const layout = useMemo<Layout>(() => {
    const _rows = rows(steps);
    return { width, offsets, rows: _rows, rowY: rowYs(rowHeight), heights };
  }, [steps, width, offsets, rowHeight, heights]);
  const canvasHeight = useMemo(() => canvasH(layout.rowY, rowHeight), [layout.rowY, rowHeight]);
  const connectorWidth = cw(width);

  const updateHeights = useCallback((callback: (prev: Heights) => Heights) => setHeights(callback), []);
  const updateWidth = useCallback((next: number) => setWidth((prev) => (prev === next ? prev : next)), []);
  const updateSelected = (id: string | null) => setSelected((prev) => (prev === id ? prev : id));
  const zoomBy = useCallback(
    (factor: number) => setScale((s) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(s * factor).toFixed(3)))),
    [],
  );
  const resetZoom = useCallback(() => setScale(1), []);

  const onPointerDown = (node: StepNode) => (event: React.PointerEvent<HTMLDivElement>) => {
    if (readOnly) return;
    if ((event.target as Element).closest("[data-ui]")) return;
    const off = offsets[node.id];
    drag.current = {
      id: node.id,
      startX: event.clientX,
      startY: event.clientY,
      baseDx: off?.dx ?? 0,
      baseDy: off?.dy ?? 0,
      moved: false,
    };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const onPointerMove = (node: StepNode) => (event: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== node.id) return;
    const dx = d.baseDx + (event.clientX - d.startX) / scale;
    const dy = d.baseDy + (event.clientY - d.startY) / scale;
    if (!d.moved && Math.hypot(dx - d.baseDx, dy - d.baseDy) < 3) return;
    d.moved = true;

    // keep the card inside the canvas
    const { w } = place(node, layout);
    const h = heights[node.id] ?? 90;
    const baseCx = node.x * connectorWidth;
    const baseTop = layout.rowY[layout.rows.indexOf(node.row)] ?? 0;
    const cx = Math.min(Math.max(baseCx + dx, w / 2 + 8), connectorWidth - w / 2 - 8);
    const top = Math.min(Math.max(baseTop + dy, 8), canvasHeight - h - 8);
    setOffsets((current) => ({ ...current, [node.id]: { dx: cx - baseCx, dy: top - baseTop } }));
  };

  const onPointerUp = (node: StepNode) => () => {
    const d = drag.current;
    if (d?.id !== node.id) return;
    if (d.moved) {
      onDrag?.(node.id, offsets[node.id] ?? { dx: 0, dy: 0 });
      // a real drag shouldn't also toggle selection
      setTimeout(() => (drag.current = null), 0);
    } else drag.current = null;
  };

  const wasDragged = () => drag.current?.moved === true;
  const isLit = (edge: Edge) => selected === edge.source || selected === edge.target;
  const bezierCurve = (edge: Edge) => bezier({ from: edge.source, to: edge.target }, steps, layout);
  const handlePlace = (node: StepNode) => place(node, layout);

  /** Children that would lose their only parent if `id` were removed. */
  const orphansOf = (id: string) =>
    edges
      .filter((e) => e.source === id)
      .map((e) => e.target)
      .filter((child) => !edges.some((e) => e.target === child && e.source !== id));

  const removeNode = (id: string) => {
    const orphans = orphansOf(id);
    // ponytail: native confirm; swap for AlertDialog if the design calls for one
    if (orphans.length && !window.confirm(`Deleting this node leaves ${orphans.length} child node${orphans.length > 1 ? "s" : ""} orphaned. Delete anyway?`)) return;
    if (selected === id) setSelected(null);
    onRemove?.(id);
  };

  return {
    steps,
    edges,
    readOnly,
    zoomable,
    scale,
    zoomBy,
    resetZoom,
    onAdd,
    removeNode,
    orphansOf,
    updateHeights,
    offsets,
    width,
    selected,
    drag,
    updateSelected,
    updateWidth,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    wasDragged,
    isLit,
    rowHeight,
    canvasHeight,
    connectorWidth,
    bezierCurve,
    handlePlace,
  };
};

export type FlowchartController = ReturnType<typeof useFlowchart>;

/** Root owns the one `useFlowchart` instance; nodes read it from here. */
export const FlowchartContext = createContext<FlowchartController | null>(null);

export const useFlowchartContext = () => {
  const ctx = useContext(FlowchartContext);
  if (!ctx) throw new Error("Flowchart.ChartNode must render inside Flowchart.Root");
  return ctx;
};
