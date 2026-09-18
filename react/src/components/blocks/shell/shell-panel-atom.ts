import { atom } from "jotai"
import type { TSidebarComponentMap, TSidebarSide } from "./type"

type OpenState = Record<TSidebarSide, boolean>
type Handlers = {
  setOpen: (open: boolean, side: TSidebarSide) => void
  setOpenMobile: (open: boolean, side: TSidebarSide) => void
}
function createState() {
  const railWidth = atom<number | null>(null)
  const resizeSidebar = atom(null, (_get, set, width: number) => {
    if (Number.isFinite(width))
      set(railWidth, Math.max(180, Math.min(480, width)))
  })
  const open = atom<OpenState>({ left: true, right: false })
  const mobile = atom<OpenState>({ left: false, right: false })
  const components = atom<TSidebarComponentMap>({})
  const handlers = atom<Handlers | null>(null)
  const seeded = atom(false)
  const setOpen = atom(null, (get, set, value: boolean, side: TSidebarSide) => {
    const host = get(handlers)
    if (host) host.setOpen(value, side)
    else set(open, { ...get(open), [side]: value })
  })
  const setOpenMobile = atom(
    null,
    (get, set, value: boolean, side: TSidebarSide) => {
      const host = get(handlers)
      if (host) host.setOpenMobile(value, side)
      else set(mobile, { ...get(mobile), [side]: value })
    }
  )
  const toggle = atom(null, (get, set, side: TSidebarSide) =>
    set(setOpen, !get(open)[side], side)
  )
  const seed = atom(
    null,
    (
      get,
      set,
      initial?: Partial<OpenState>,
      initialMobile?: Partial<OpenState>
    ) => {
      if (get(seeded)) return
      set(seeded, true)
      set(open, { ...get(open), ...initial })
      set(mobile, { ...get(mobile), ...initialMobile })
    }
  )
  return {
    railWidth,
    resizeSidebar,
    open,
    mobile,
    components,
    handlers,
    setOpen,
    setOpenMobile,
    toggle,
    seed,
  }
}
const instances = new Map<string, ReturnType<typeof createState>>()
export function shellPanelAtoms(id: string) {
  let state = instances.get(id)
  if (!state) {
    state = createState()
    instances.set(id, state)
  }
  return state
}
export function removeShellPanelInstance(id: string) {
  instances.delete(id)
}
