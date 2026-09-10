import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { Edge, EdgeEnd, FlowchartProps, StepNode } from "./types";
import { anchors, bezier, canvasH, curve, cw, edgePoints, place, rowH, rows, rowYs, type Heights, type Layout, type Offsets, type Point } from "./utils";
import { EST_H, SNAP_RADIUS } from "./constant";
import { toastManager } from "@/components/ui/toast";

export const ZOOM_MIN = 0.25;
export const ZOOM_MAX = 2;

type Options = Pick<FlowchartProps, "edges" | "readOnly" | "zoomable" | "onDrag" | "onAdd" | "onRemove" | "onEdgeRemove" | "onEdgeConnect" | "onEdgeChange" | "onRename" | "onDuplicate"> & {
  steps: StepNode[];
  canvasRef: React.RefObject<HTMLDivElement | null>;
};

/** A connector end being dragged towards a new card; `snap` is the card whose anchor is in range. */
export type EdgeDrag = { id: string; end: EdgeEnd; point: Point; snap?: string };

/** Pill text: explicit name, else the kind label, else "Node n" (conditions always count). */
export const nodeLabel = (node: StepNode, index: number) =>
  node.name ?? (node.condition || !node.kind ? `Node ${index + 1}` : node.kind.label);

/** Default connectors: a chain through the steps in order. */
export const chainEdges = (steps: StepNode[]): Edge[] =>
  steps.slice(1).map((n, i) => ({ id: `${steps[i].id}->${n.id}`, source: steps[i].id, target: n.id }));

export const useFlowchart = ({ steps, edges: edgesProp, readOnly = false, zoomable = false, onDrag, onAdd, onRemove, onEdgeRemove, onEdgeConnect, onEdgeChange, onRename, onDuplicate, canvasRef }: Options) => {
  /** Visible canvas box; the world behind it is twice this size. */
  const [frame, setFrame] = useState({ w: 0, h: 0 });
  const [heights, setHeights] = useState<Heights>(EST_H);
  const [selected, setSelected] = useState<string | null>(null);
  const [offsets, setOffsets] = useState<Offsets>({});
  /** Zoom and pan of the world inside the frame (pan in frame px). */
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const scale = view.scale;
  const pan = useRef<{ startX: number; startY: number; baseX: number; baseY: number; moved: boolean } | null>(null);
  const [pendingRemove, setPendingRemove] = useState<{ id: string; orphans: string[] } | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [edgeDrag, setEdgeDrag] = useState<EdgeDrag | null>(null);
  /** Card highlighted while the user browses "Connect to…" in the context menu. */
  const [previewNode, setPreviewNode] = useState<string | null>(null);
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
  // The world is twice the frame so there is always hidden canvas to drag into view.
  const width = frame.w * 2;
  const layout = useMemo<Layout>(() => {
    const _rows = rows(steps);
    return { width, offsets, rows: _rows, rowY: rowYs(rowHeight), heights };
  }, [steps, width, offsets, rowHeight, heights]);
  const canvasHeight = useMemo(() => canvasH(layout.rowY, rowHeight), [layout.rowY, rowHeight]);
  const connectorWidth = cw(width);
  const worldHeight = Math.max(canvasHeight, frame.h * 2);

  /** Keep the world covering the frame: clamp when it is larger, centre it when smaller. */
  const clampPan = useCallback(
    (x: number, y: number, s: number, f = frame) => {
      const fit = (offset: number, visible: number, content: number) =>
        content <= visible ? (visible - content) / 2 : Math.min(0, Math.max(visible - content, offset));
      return { x: fit(x, f.w, connectorWidth * s), y: fit(y, f.h, worldHeight * s) };
    },
    [frame, connectorWidth, worldHeight],
  );

  const updateHeights = useCallback((callback: (prev: Heights) => Heights) => setHeights(callback), []);
  const updateFrame = useCallback((w: number, h: number) => {
    setFrame((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    // First measurement centres the world horizontally, top-aligned; later
    // width changes scale the pan so the view stays put as the world resizes.
    const prevW = frame.w;
    setView((v) => {
      if (w <= 0 || w === prevW) return v;
      return prevW === 0 ? { ...v, x: (w - w * 2 * v.scale) / 2, y: 0 } : { ...v, x: (v.x * w) / prevW };
    });
  }, [frame.w]);
  const updateSelected = (id: string | null) => {
    setSelected((prev) => (prev === id ? prev : id));
    if (id !== null) setSelectedEdge(null);
  };
  const editableEdges = !readOnly && Boolean(onEdgeRemove || onEdgeConnect || onEdgeChange);
  const selectEdge = (id: string | null) => {
    if (!editableEdges) return;
    setSelectedEdge(id);
    if (id !== null) setSelected(null);
  };
  /** Zoom about the frame centre so what is in the middle stays there. */
  const zoomTo = useCallback(
    (next: number) =>
      setView((v) => {
        const s = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +next.toFixed(3)));
        const cx = frame.w / 2;
        const cy = frame.h / 2;
        const k = s / v.scale;
        return { scale: s, ...clampPan(cx - (cx - v.x) * k, cy - (cy - v.y) * k, s) };
      }),
    [frame, clampPan],
  );
  const zoomBy = useCallback((factor: number) => zoomTo(scale * factor), [zoomTo, scale]);
  const resetZoom = useCallback(() => zoomTo(1), [zoomTo]);

  /** Dragging empty canvas pans the world; a still click clears the selection. */
  const onCanvasPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const target = event.target as Element;
    if (target.closest("[data-node], [data-ui], [data-edge-handle], [data-edge]")) return;
    pan.current = { startX: event.clientX, startY: event.clientY, baseX: view.x, baseY: view.y, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onCanvasPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const p = pan.current;
    if (!p) return;
    const dx = event.clientX - p.startX;
    const dy = event.clientY - p.startY;
    if (!p.moved && Math.hypot(dx, dy) < 3) return;
    p.moved = true;
    setView((v) => ({ ...v, ...clampPan(p.baseX + dx, p.baseY + dy, v.scale) }));
  };
  const onCanvasPointerUp = () => {
    const p = pan.current;
    pan.current = null;
    if (p && !p.moved) {
      setSelected(null);
      setSelectedEdge(null);
    }
  };
  const isPanning = () => pan.current?.moved === true;

  const onPointerDown = (node: StepNode) => (event: React.PointerEvent<HTMLDivElement>) => {
    // Left button only: a right-press belongs to the context menu.
    if (readOnly || event.button !== 0) return;
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
    const top = Math.min(Math.max(baseTop + dy, 8), worldHeight - h - 8);
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
  const isLit = (edge: Edge) => selected === edge.source || selected === edge.target || selectedEdge === edge.id;

  /** Client → unscaled canvas coordinates. */
  const toCanvas = (clientX: number, clientY: number): Point => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return { x: (clientX - (rect?.left ?? 0) - view.x) / scale, y: (clientY - (rect?.top ?? 0) - view.y) / scale };
  };
  const edgeEnds = (edge: Edge) => edgePoints({ from: edge.source, to: edge.target }, steps, layout);

  const onEdgeHandleDown = (edge: Edge, end: EdgeEnd) => (event: React.PointerEvent<SVGElement>) => {
    if (!onEdgeConnect) return;
    event.stopPropagation();
    (event.currentTarget as Element).setPointerCapture(event.pointerId);
    setEdgeDrag({ id: edge.id, end, point: toCanvas(event.clientX, event.clientY) });
  };
  /** Nearest anchor of another card within SNAP_RADIUS: top anchors for a target end, bottom for a source end. */
  const snapCandidate = (edge: Edge, end: EdgeEnd, point: Point) => {
    const other = end === "source" ? edge.target : edge.source;
    let best: { id: string; d: number } | null = null;
    for (const node of steps) {
      if (node.id === other) continue;
      const a = anchors(node, layout);
      const p = end === "source" ? a.bottom : a.top;
      const d = Math.hypot(p.x - point.x, p.y - point.y);
      if (d <= SNAP_RADIUS && (!best || d < best.d)) best = { id: node.id, d };
    }
    return best?.id;
  };
  const onEdgeHandleMove = (event: React.PointerEvent<SVGElement>) => {
    if (!edgeDrag) return;
    const point = toCanvas(event.clientX, event.clientY);
    const edge = edges.find((e) => e.id === edgeDrag.id);
    const snap = edge ? snapCandidate(edge, edgeDrag.end, point) : undefined;
    setEdgeDrag({ ...edgeDrag, point, snap });
  };
  const onEdgeHandleUp = (event: React.PointerEvent<SVGElement>) => {
    if (!edgeDrag) return;
    const edge = edges.find((e) => e.id === edgeDrag.id);
    const card = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-node]");
    const target = edgeDrag.snap ?? card?.dataset.node;
    setEdgeDrag(null);
    if (!edge || !target) return;
    const other = edgeDrag.end === "source" ? edge.target : edge.source;
    if (target === other || target === edge[edgeDrag.end]) return;
    onEdgeConnect?.({ ...edge, [edgeDrag.end]: target });
  };
  /** Path of the connector being re-routed, following the pointer. */
  const ghostCurve = () => {
    if (!edgeDrag) return "";
    const edge = edges.find((e) => e.id === edgeDrag.id);
    const pts = edge && edgeEnds(edge);
    if (!pts) return "";
    const snapNode = edgeDrag.snap ? steps.find((n) => n.id === edgeDrag.snap) : undefined;
    const point = snapNode ? anchors(snapNode, layout)[edgeDrag.end === "source" ? "bottom" : "top"] : edgeDrag.point;
    return edgeDrag.end === "source" ? curve(point, pts.to) : curve(pts.from, point);
  };
  /** "Connect to…": a new connector from `source` to `target`, unless one exists. */
  const connectTo = (source: string, target: string) => {
    if (source === target || edges.some((e) => e.source === source && e.target === target)) return;
    onEdgeConnect?.({ id: `${source}->${target}`, source, target });
  };
  const renameNode = (id: string, name: string) => {
    onRename?.(id, name);
    toastManager.add({ title: "Node renamed", description: name, type: "success" });
  };
  const duplicateNode = (id: string) => onDuplicate?.(id);
  const snapTarget = edgeDrag?.snap ?? null;
  const removeEdge = (id: string) => {
    setSelectedEdge(null);
    onEdgeRemove?.(id);
  };
  const bezierCurve = (edge: Edge) => bezier({ from: edge.source, to: edge.target }, steps, layout);
  const handlePlace = (node: StepNode) => place(node, layout);

  /** Children that would lose their only parent if `id` were removed. */
  const orphansOf = (id: string) =>
    edges
      .filter((e) => e.source === id)
      .map((e) => e.target)
      .filter((child) => !edges.some((e) => e.target === child && e.source !== id));

  const commitRemove = (id: string) => {
    if (selected === id) setSelected(null);
    setPendingRemove(null);
    onRemove?.(id);
  };

  /** Removes outright, or parks the id in `pendingRemove` for Root's AlertDialog when children would be orphaned. */
  const removeNode = (id: string) => {
    const orphans = orphansOf(id);
    if (orphans.length) setPendingRemove({ id, orphans });
    else commitRemove(id);
  };
  const cancelRemove = () => setPendingRemove(null);

  return {
    steps,
    edges,
    readOnly,
    zoomable,
    scale,
    view,
    zoomBy,
    resetZoom,
    onCanvasPointerDown,
    onCanvasPointerMove,
    onCanvasPointerUp,
    isPanning,
    frame,
    worldHeight,
    onAdd,
    removeNode,
    commitRemove,
    cancelRemove,
    pendingRemove,
    orphansOf,
    updateHeights,
    offsets,
    width,
    selected,
    drag,
    updateSelected,
    updateFrame,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    wasDragged,
    isLit,
    editableEdges,
    selectedEdge,
    selectEdge,
    edgeDrag,
    edgeEnds,
    onEdgeHandleDown,
    onEdgeHandleMove,
    onEdgeHandleUp,
    ghostCurve,
    removeEdge,
    onEdgeChange,
    snapTarget,
    previewNode,
    setPreviewNode,
    connectTo,
    renameNode,
    duplicateNode,
    canRename: Boolean(onRename),
    canDuplicate: Boolean(onDuplicate),
    canConnect: Boolean(onEdgeConnect),
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
