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
  /**
   * Canvas height floor in px. The canvas grows past it only when the scaled
   * content is taller, so zooming out or removing a card never collapses it.
   */
  height?: number
  /** Disconnect was pressed on a selected connector. Enables connector editing. */
  onEdgeRemove?: (id: string) => void
  /** A connector end was dropped on another card; `edge` carries the new source / target. */
  onEdgeConnect?: (edge: Edge) => void
  /** Stroke width or colour picked from the connector toolbar. */
  onEdgeChange?: (id: string, patch: Pick<Edge, "strokeWidth" | "color">) => void
  /** The pill was renamed inline (double-click, then click away or Enter). */
  onRename?: (id: string, name: string) => void
  /** "Duplicate" in the context menu: copy the card to a new node on its right. */
  onDuplicate?: (id: string) => void
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
  /** Pill text; defaults to the kind label, or "Node n" for conditions. */
  name?: string
  hue?: string
  title?: string
  caption?: string
  /** Replaces the icon tile — a person, a manuscript, a corpus cover. */
  image?: { src: string; alt?: string }
  /** Custom tile icon when there is no image. */
  icon?: React.ReactNode
  condition?: boolean // renders the if/else chip rows instead
  /** Custom card body; replaces the default title / caption body. */
  children?: React.ReactNode
}

export type Edge = {
  id: string
  source: string
  target: string
  bezierCurve?: boolean
  strokeWidth?: number
  /** Any CSS colour; defaults to the line token, accent when lit. */
  color?: string
}

export type EdgeEnd = "source" | "target"

export interface ConnectorProps extends Omit<SVGProps<SVGPathElement>, "strokeWidth"> {
  edge: Edge
  isLit: boolean
  strokeWidth?: number
  /** Selected for editing: bolder hit, toolbar and end handles render in Root. */
  selected?: boolean
  /** Enables the wide click target; called with the edge id. */
  onPick?: (id: string) => void
}

export interface ChartNodeProps {
  node: StepNode
  /** Position in `steps`, for the generated "Node n" label. */
  index?: number
  onRef: (el: HTMLDivElement | null) => void
  children?: React.ReactNode
}
