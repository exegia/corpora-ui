import { atom } from "jotai"
import type { IChartState, TChartInstanceId } from "./type"

function createChartAtoms(id: TChartInstanceId) {
  const selected = atom<string | null>(null)
  selected.debugLabel = `chart/${id}/selectedKey`
  const config = atom<{
    controlled: boolean
    initial: string | null
    keys: readonly string[]
    onChange?: (key: string | null) => void
  }>({ controlled: false, initial: null, keys: [] })
  const select = atom(null, (get, set, key: string | null) => {
    const settings = get(config)
    if (key !== null && !settings.keys.includes(key)) return
    if (get(selected) === key) return
    if (!settings.controlled) set(selected, key)
    settings.onChange?.(key)
  })
  const toggle = atom(null, (get, set, key: string) =>
    set(select, get(selected) === key ? null : key)
  )
  const reset = atom(null, (get, set) => {
    const { initial, keys } = get(config)
    set(select, initial !== null && keys.includes(initial) ? initial : null)
  })
  const state = atom<IChartState>((get) => ({ selectedKey: get(selected) }))
  return { selected, config, select, toggle, reset, state }
}
const instances = new Map<
  TChartInstanceId,
  ReturnType<typeof createChartAtoms>
>()
function chartAtoms(id: TChartInstanceId) {
  let atoms = instances.get(id)
  if (!atoms) {
    atoms = createChartAtoms(id)
    instances.set(id, atoms)
  }
  return atoms
}
export const chartSelectedKeyAtom = (id: TChartInstanceId) =>
  chartAtoms(id).selected
export const chartStateAtom = (id: TChartInstanceId) => chartAtoms(id).state
export const selectChartKeyAtom = (id: TChartInstanceId) =>
  chartAtoms(id).select
export const toggleChartKeyAtom = (id: TChartInstanceId) =>
  chartAtoms(id).toggle
export const resetChartAtom = (id: TChartInstanceId) => chartAtoms(id).reset
/** @internal Mounted root projects configuration and controlled props. */
export const chartConfigAtom = (id: TChartInstanceId) => chartAtoms(id).config
/** Call only after all consumers of a named instance have unmounted. */
export function removeChartInstance(id: TChartInstanceId) {
  instances.delete(id)
}
