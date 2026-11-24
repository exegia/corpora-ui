import Root from "./default"
import { Connector } from "./connector"
import { ChartNode } from "./chart-node"

export type * from "./type"
export * from "./hooks"

export const Flowchart = {
  Root,
  Connector,
  ChartNode,
}

export default Root
