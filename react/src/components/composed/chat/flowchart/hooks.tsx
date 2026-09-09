
import React, { useCallback, useMemo, useRef, useState } from "react";
import type { Edge, StepNode } from "./types";
import { bezier, canvasH, cw, place, rowH, rows, rowY } from "./utils";
import { EST_H, PAD_Y } from "./constant";

export const useFlowchart = ({ steps }: { steps: StepNode[] }) => {

  const [width, setWidth] = useState(0);
  const [heights, setHeights] = useState<Record<string, number>>(EST_H);
  const [selected, setSelected] = useState<string | null>(null);
  const [offsets, setOffsets] = useState<Record<string, { dx: number; dy: number }>>({});
  const drag = useRef<{
    id: string;
    startX: number;
    startY: number;
    baseDx: number;
    baseDy: number;
    moved: boolean;
  } | null>(null);

  const _rows = rows(steps)

  const updateHeights = (callback: (prev: Record<string, number>) => Record<string, number>) => {
    setHeights(callback);
  };

  const updateOffsets = useCallback((payload: Record<string, { dx: number; dy: number }>) => {
    if (offsets === payload) return;
    setOffsets(payload);
  }, [offsets]);

  const updateSelected = (id: string | null) => {
    if (selected === id) return;
    setSelected(id);
  };

  const updateWidth = (width: number) => {
    if (width === width) return;
    setWidth(width);
  };

  /**
   * onPointerDown handler for dragging nodes.
   * 
   * @param node The node to drag. `StepNode`
   */
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
  
  /**
   * onPointerMove handler for dragging nodes.
   * 
   * @param node The node to drag. `StepNode`
   */
  const onPointerMove = (node: StepNode) => (event: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== node.id) return;
    const dx = d.baseDx + event.clientX - d.startX;
    const dy = d.baseDy + event.clientY - d.startY;
    if (!d.moved && Math.hypot(dx - d.baseDx, dy - d.baseDy) < 3) return;
    d.moved = true;
    
    const _cw = cw(width)
    const _rowH = rowH(steps, heights)
    const _canvasH = canvasH(rowY, _rowH, PAD_Y)
    /**
     * Keep the card inside the canvas
     */
    const { w } = place(node, width, offsets, _rows);
    const h = heights[node.id] ?? 90;
    const baseCx = node.x * _cw;
    const baseTop = rowY[_rows.indexOf(node.row)];
    const cx = Math.min(Math.max(baseCx + dx, w / 2 + 8), _cw - w / 2 - 8);
    const top = Math.min(Math.max(baseTop + dy, 8), _canvasH - h - 8);
    setOffsets((current) => ({ ...current, [node.id]: { dx: cx - baseCx, dy: top - baseTop } }));
  };
  
  const onPointerUp = (node: StepNode) => () => {
    const d = drag.current;
    if (d?.id === node.id) {
      /**
       * A real drag shouldn't also toggle selection
       */
      if (d.moved) setTimeout(() => (drag.current = null), 0);
      else drag.current = null;
    }
  };
  
  const wasDragged = () => drag.current?.moved === true;
  
  const isLit = (edge: Edge) =>
    selected === edge.source || selected === edge.target;



  const rowHeight = useMemo(() => rowH(steps, heights), [heights, steps])
  const canvasHeight = useMemo(() => canvasH(rowY, rowHeight, PAD_Y), [rowHeight])
  const connectorWidth = useMemo(() => cw(width), [width])
  const bezierCurve = useCallback((edge: Edge) => bezier({ to: edge.target, from: edge.source }, width, offsets, steps, _rows, heights), [width, offsets, _rows, steps, heights])

  const handlePlace = useCallback((node: StepNode) => {
    const { w, cx, top } = place(node, width, offsets, _rows);
    updateOffsets({ ...offsets, [node.id]: { dx: cx - node.x * connectorWidth, dy: top - rowY[node.row] } });
    return { w, cx, top }
  }, [width, offsets, _rows, updateOffsets, connectorWidth]);

  return {
    updateHeights,
    offsets,
    width,
    selected,
    drag,
    updateOffsets,
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
