"use client"

import { useEffect, useLayoutEffect, useRef } from "react"
import { Minus, Plus } from "lucide-react"
import type { FlowchartProps, StepNode } from "./types"
import { FlowchartContext, useFlowchart } from "./hooks"
import { AMBER, PURPLE } from "./constant"
import { Connector } from "./connector"
import { ChartNode } from "./chart-node"
import { EdgeToolbar } from "./edge-toolbar"
import { midpoint } from "./utils"
import { IconButton } from "@/components/ui/chat"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

const NODES: StepNode[] = [
  {
    id: "trigger",
    row: 0,
    x: 0.5,
    w: 300,
    kind: { label: "Trigger", hue: PURPLE },
    hue: PURPLE,
    title: "New order created",
    caption: "Trigger when a new order is created",
  },
  {
    id: "cond",
    row: 1,
    x: 0.5,
    w: 356,
    kind: { label: "If / Else", hue: AMBER },
    condition: true,
  },
]

/**
 * Dot-grid canvas of draggable, selectable step cards joined by bezier connectors.
 *
 * @sketch "Component / Flowchart"
 */
export default function Flowchart({ steps = NODES, edges, readOnly, zoomable, height = 360, onDrag, onAdd, onRemove, onEdgeRemove, onEdgeConnect, onEdgeChange, className, children }: FlowchartProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef(new Map<string, HTMLElement>())
  const chart = useFlowchart({ steps, edges, readOnly, zoomable, onDrag, onAdd, onRemove, onEdgeRemove, onEdgeConnect, onEdgeChange, canvasRef })
  const {
    updateHeights, updateWidth, canvasHeight, isLit, bezierCurve, connectorWidth, scale, zoomBy, resetZoom, pendingRemove, commitRemove, cancelRemove,
    editableEdges, selectedEdge, selectEdge, edgeDrag, edgeEnds, onEdgeHandleDown, onEdgeHandleMove, onEdgeHandleUp, ghostCurve, removeEdge,
  } = chart
  // Floor, never a ceiling: the frame only grows when scaled content is taller.
  const frameHeight = Math.max(height, canvasHeight * scale)
  const selectedEdgeObj = chart.edges.find((e) => e.id === selectedEdge)
  const selectedEnds = selectedEdgeObj ? edgeEnds(selectedEdgeObj) : null

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const measure = () => {
      updateWidth(canvas.clientWidth)
      updateHeights((prev) => {
        const next = { ...prev }
        let changed = false
        nodeRefs.current.forEach((el, id) => {
          const h = el.offsetHeight
          if (h && Math.abs(h - (next[id] ?? 0)) > 0.5) {
            next[id] = h
            changed = true
          }
        })
        return changed ? next : prev
      })
    }

    measure()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(measure)
    observer.observe(canvas)
    nodeRefs.current.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [updateHeights, updateWidth, steps])

  // React's onWheel is passive, so preventDefault (no page scroll while zooming) needs a native listener.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !zoomable) return
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      zoomBy(event.deltaY < 0 ? 1.1 : 1 / 1.1)
    }
    canvas.addEventListener("wheel", onWheel, { passive: false })
    return () => canvas.removeEventListener("wheel", onWheel)
  }, [zoomable, zoomBy])

  return (
    <FlowchartContext.Provider value={chart}>
      <div
        ref={canvasRef}
        data-slot="flowchart"
        data-readonly={readOnly || undefined}
        className={cn("rounded-card bg-page shadow-hairline relative w-full overflow-hidden select-none", className)}
        onClick={() => selectEdge(null)}
        style={{
          height: frameHeight,
          backgroundImage: "radial-gradient(var(--line-strong) 1px, transparent 1.25px)",
          backgroundSize: `${22 * scale}px ${22 * scale}px`,
          backgroundPosition: "center",
        }}
      >
        {children}
        <div className="absolute inset-x-0 top-0 origin-top" style={{ height: canvasHeight, transform: `scale(${scale})` }}>
          <svg width={connectorWidth} height={canvasHeight} className="pointer-events-none absolute inset-0 overflow-visible">
            {chart.edges.map((edge) => (
              <Connector
                key={edge.id}
                edge={edge}
                isLit={isLit(edge)}
                selected={selectedEdge === edge.id}
                onPick={editableEdges ? selectEdge : undefined}
                d={bezierCurve(edge)}
              />
            ))}
          </svg>
          {selectedEdgeObj && selectedEnds ? (
            <EdgeToolbar
              edge={selectedEdgeObj}
              at={midpoint(selectedEnds.from, selectedEnds.to)}
              onChange={onEdgeChange}
              onRemove={onEdgeRemove ? removeEdge : undefined}
            />
          ) : null}
          {steps.map((node) => (
            <ChartNode
              key={node.id}
              node={node}
              onRef={(el) => {
                if (el) nodeRefs.current.set(node.id, el)
                else nodeRefs.current.delete(node.id)
              }}
            />
          ))}
          {/* Above the cards, so the grab handles are reachable at a card's edge. */}
          <svg width={connectorWidth} height={canvasHeight} className="pointer-events-none absolute inset-0 z-10 overflow-visible">
            {edgeDrag ? (
              <path data-edge-ghost fill="none" stroke="var(--accent-default)" strokeWidth={1.5} strokeDasharray="4 3" d={ghostCurve()} />
            ) : null}
            {selectedEdgeObj && selectedEnds && onEdgeConnect
              ? (["source", "target"] as const).map((end) => {
                  const p = end === "source" ? selectedEnds.from : selectedEnds.to
                  return (
                    <g key={end}>
                      <circle cx={p.x} cy={p.y} r={5} fill="var(--surface)" stroke="var(--accent-default)" strokeWidth={1.5} />
                      {/* Generous invisible grab target over the 5px dot. */}
                      <circle
                        data-edge-handle={end}
                        cx={p.x}
                        cy={p.y}
                        r={12}
                        fill="transparent"
                        className="pointer-events-auto cursor-grab touch-none active:cursor-grabbing"
                        onPointerDown={onEdgeHandleDown(selectedEdgeObj, end)}
                        onPointerMove={onEdgeHandleMove}
                        onPointerUp={onEdgeHandleUp}
                      />
                    </g>
                  )
                })
              : null}
          </svg>
        </div>
        {zoomable ? (
          <div data-ui className="absolute right-2 bottom-2 flex items-center gap-0.5 rounded-md bg-surface p-0.5 shadow-btn">
            <IconButton aria-label="Zoom out" onClick={() => zoomBy(1 / 1.25)}><Minus /></IconButton>
            <button type="button" onClick={resetZoom} className="min-w-10 text-center text-[11px] tabular-nums text-ink-2">
              {Math.round(scale * 100)}%
            </button>
            <IconButton aria-label="Zoom in" onClick={() => zoomBy(1.25)}><Plus /></IconButton>
          </div>
        ) : null}
      </div>
      <AlertDialog open={pendingRemove !== null} onOpenChange={(open) => { if (!open) cancelRemove() }}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this node?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRemove?.orphans.length === 1
                ? "One child node has no other parent and will be left orphaned."
                : `${pendingRemove?.orphans.length ?? 0} child nodes have no other parent and will be left orphaned.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant="ghost" />}>Cancel</AlertDialogClose>
            <Button variant="destructive" onClick={() => pendingRemove && commitRemove(pendingRemove.id)}>
              Delete anyway
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </FlowchartContext.Provider>
  )
}
