"use client"
import { createContext, useContext } from "react"
export const ChartContext = createContext<string | null>(null)
export function useChartContext() {
  const id = useContext(ChartContext)
  if (id === null)
    throw new Error("useChartContext must be used within <Chart>")
  return id
}
