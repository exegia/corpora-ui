"use client"

import { useLayoutEffect, useRef } from "react"
import type { FlowchartProps, StepNode } from "./types"
import { FlowchartContext, useFlowchart } from "./hooks"
import { AMBER, EDGES, PURPLE } from "./constant"
import { Connector } from "./connector"
import { ChartNode } from "./chart-node"
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
 * Dot-grid canvas with draggable, selectable step cards joined by bezier connectors.
 *
 * @sketch "Component / Flowchart"
 */
export default function Flowchart({ steps = NODES, className, children }: FlowchartProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef(new Map<string, HTMLElement>())
  const chart = useFlowchart({ steps })
  const { updateHeights, updateWidth, canvasHeight, isLit, bezierCurve, connectorWidth } = chart

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
  }, [updateHeights, updateWidth])

  return (
    <FlowchartContext.Provider value={chart}>
      <div
        ref={canvasRef}
        data-slot="flowchart"
        className={cn("rounded-card bg-page shadow-hairline relative w-full overflow-hidden select-none", className)}
        style={{
          height: canvasHeight,
          backgroundImage: "radial-gradient(var(--line-strong) 1px, transparent 1.25px)",
          backgroundSize: "22px 22px",
          backgroundPosition: "center",
        }}
      >
        {children}
        <svg width={connectorWidth} height={canvasHeight} className="pointer-events-none absolute inset-0">
          {EDGES.map((edge) => (
            <Connector key={edge.id} edge={edge} isLit={isLit(edge)} d={bezierCurve(edge)} />
          ))}
        </svg>
        {steps.map((node) => (
          <ChartNode
            key={node.id}
            node={node}
            steps={steps}
            onRef={(el) => {
              if (el) nodeRefs.current.set(node.id, el)
              else nodeRefs.current.delete(node.id)
            }}
          />
        ))}
      </div>
    </FlowchartContext.Provider>
  )
}
