"use client"
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useStore } from "jotai"
import {
  chartConfigAtom,
  chartSelectedKeyAtom,
  removeChartInstance,
} from "./chart-atom"
import { useChartActions, useChartState } from "./use-chart-state"
import type { IChartProps } from "./type"
const useClientLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect
export function useChart(props: IChartProps) {
  const generatedId = useId()
  const id = props.chartId ?? generatedId
  const store = useStore()
  const [initial] = useState(props.defaultSelectedKey ?? null)
  const lifecycle = useRef(0)
  const keys = useMemo(
    () =>
      props.type === "pie"
        ? props.data.map((row) => row.label)
        : props.series.map((s) => s.key),
    [props.type, props.data, props.series]
  )
  const state = useChartState(id)
  const actions = useChartActions(id)
  useClientLayoutEffect(() => {
    const generation = ++lifecycle.current
    store.set(chartSelectedKeyAtom(id), initial)
    // Named instances persist until removeChartInstance; generated ids have no external consumers.
    return () => {
      queueMicrotask(() => {
        if (!props.chartId && lifecycle.current === generation)
          removeChartInstance(id)
      })
    }
  }, [id, store, initial, props.chartId])
  useClientLayoutEffect(() => {
    store.set(chartConfigAtom(id), {
      controlled: props.selectedKey !== undefined,
      initial,
      keys,
      onChange: props.onSelectionChange,
    })
    const current =
      props.selectedKey !== undefined
        ? props.selectedKey
        : store.get(chartSelectedKeyAtom(id))
    store.set(
      chartSelectedKeyAtom(id),
      current !== null && keys.includes(current) ? current : null
    )
  }, [id, store, initial, keys, props.selectedKey, props.onSelectionChange])
  const candidate =
    props.selectedKey !== undefined ? props.selectedKey : state.selectedKey
  return {
    id,
    selectedKey:
      candidate !== null && keys.includes(candidate) ? candidate : null,
    actions,
  }
}
