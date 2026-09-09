import type { SVGProps } from "react"

export interface FlowchartProps {
  steps?: StepNode[]
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
  NodeComponent?: React.ComponentType<ChartNodeProps>
  hue?: string
  title?: string
  caption?: string
  condition?: boolean // renders the if/else chip rows instead
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
  steps: StepNode[]
  onRef: (el: HTMLDivElement | null) => void
  children?: React.ReactNode
}
