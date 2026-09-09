import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { Edge, StepNode } from "./types";
import { bezier, canvasH, cw, place, rowH, rows, rowYs, type Heights, type Layout, type Offsets } from "./utils";
import { EST_H } from "./constant";

export const useFlowchart = ({ steps }: { steps: StepNode[] }) => {
  const [width, setWidth] = useState(0);
  const [heights, setHeights] = useState<Heights>(EST_H);
  const [selected, setSelected] = useState<string | null>(null);
  const [offsets, setOffsets] = useState<Offsets>({});
  const drag = useRef<{
    id: string;
    startX: number;
    startY: number;
    baseDx: number;
    baseDy: number;
    moved: boolean;
  } | null>(null);

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

  const onPointerDown = (node: StepNode) => (event: React.PointerEvent<HTMLDivElement>) => {
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
    const dx = d.baseDx + event.clientX - d.startX;
    const dy = d.baseDy + event.clientY - d.startY;
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
    // a real drag shouldn't also toggle selection
    if (d.moved) setTimeout(() => (drag.current = null), 0);
    else drag.current = null;
  };

  const wasDragged = () => drag.current?.moved === true;
  const isLit = (edge: Edge) => selected === edge.source || selected === edge.target;
  const bezierCurve = (edge: Edge) => bezier({ from: edge.source, to: edge.target }, steps, layout);
  const handlePlace = (node: StepNode) => place(node, layout);

  return {
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
