import Root from "./default"
import { Connector } from "./connector"
import { ChartNode } from "./chart-node"

export type * from "./types"
export * from "./hooks"

export const Flowchart = {
  Root,
  Connector,
  ChartNode,
}

export default Root
