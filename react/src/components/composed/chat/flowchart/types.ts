import type { SVGProps } from "react"

export type FlowchartSide = "top" | "right" | "bottom" | "left"

export interface FlowchartProps {
  /** Cards to lay out. Defaults to the Trigger → If / Else sample. */
  steps?: StepNode[]
  /** Connectors. Defaults to a chain through `steps` in order. */
  edges?: Edge[]
  /** No drag, no add / remove buttons. Selection still works. */
  readOnly?: boolean
  /** Ctrl/⌘ + wheel and the +/− buttons scale the canvas. */
  zoomable?: boolean
  /** A card was dragged; `offset` is its displacement from the laid-out position. */
  onDrag?: (id: string, offset: { dx: number; dy: number }) => void
  /** The add button on one side of a card was pressed. */
  onAdd?: (id: string, side: FlowchartSide) => void
  /** The remove button was pressed (already confirmed when children would be orphaned). */
  onRemove?: (id: string) => void
  variant?: string
  children?: React.ReactNode
  className?: string
}

export type StepNode = {
  id: string
  row: number
  x: number // 0–1 center of the node
  w: number
  kind?: { label: string; hue: string }
  hue?: string
  title?: string
  caption?: string
  condition?: boolean // renders the if/else chip rows instead
  /** Custom card body; replaces the default title / caption body. */
  children?: React.ReactNode
}

export type Edge = {
  id: string
  source: string
  target: string
  bezierCurve?: boolean
}

export interface ConnectorProps extends SVGProps<SVGPathElement> {
  edge: Edge
  isLit: boolean
}

export interface ChartNodeProps {
  node: StepNode
  onRef: (el: HTMLDivElement | null) => void
  children?: React.ReactNode
}
