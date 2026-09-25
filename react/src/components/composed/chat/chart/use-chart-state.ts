"use client"
import { useMemo } from "react"
import { useAtomValue, useSetAtom } from "jotai"
import {
  chartStateAtom,
  selectChartKeyAtom,
  toggleChartKeyAtom,
  resetChartAtom,
} from "./chart-atom"
import type { IChartStateActions, TChartInstanceId } from "./type"
export function useChartState(id: TChartInstanceId) {
  return useAtomValue(chartStateAtom(id))
}
export function useChartActions(id: TChartInstanceId): IChartStateActions {
  const select = useSetAtom(selectChartKeyAtom(id))
  const toggle = useSetAtom(toggleChartKeyAtom(id))
  const reset = useSetAtom(resetChartAtom(id))
  return useMemo(
    () => ({ select, toggle, reset, clearSelection: () => select(null) }),
    [select, toggle, reset]
  )
}
