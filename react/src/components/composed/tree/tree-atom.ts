/**
 * Per-instance Jotai state for `Tree`.
 *
 * Every atom is a module-level family keyed by a tree id, so one
 * `ExegiaProvider` at the app root is enough: many trees coexist in one store
 * without a provider each, and any component can drive a tree by id without
 * holding its controller.
 *
 * Controlled props stay authoritative. `useTree` projects them into these
 * atoms on every commit so the action atoms and remote readers work off
 * current data — a one-way projection, not a second source of truth. The
 * write gates below (`controlsItems`, `controlsActiveId`, `controlsCollapsed`)
 * are what keep the store from overwriting a prop.
 */
import { atom } from "jotai"
import type { Atom, Getter, Setter } from "jotai"

import { playCue } from "@/lib/sound"
import type {
  TreeConfig,
  TreeDropPosition,
  TreeDropTarget,
  TreeHandlers,
  TreeInstanceId,
  TreeNode,
  TreeSeed,
  TreeState,
  TreeVariant,
} from "./type"
import {
  ancestorIdsOf,
  expandableIdsOf,
  findNode,
  hasThreeLevels,
  initialExpandedIds,
  moveNode,
  renameNode,
} from "./utils"

const NO_ITEMS: TreeNode[] = []
const NO_IDS: ReadonlySet<string> = new Set<string>()
const NO_HANDLERS: TreeHandlers = {}

/** What a tree reads as before `useTree` publishes its options. */
export const DEFAULT_TREE_CONFIG: TreeConfig = {
  variant: "navigation",
  sound: true,
  controlsItems: false,
  controlsActiveId: false,
  controlsCollapsed: false,
  managesItems: true,
  hasRenameHandler: false,
  hasMoveHandler: false,
}

const DEFAULT_TREE_SEED: TreeSeed = { items: NO_ITEMS, collapsed: false }

/**
 * A string-keyed atom family.
 *
 * `jotai/utils`' `atomFamily` is deprecated for Jotai v3, and we need only
 * the string-keyed case with a `remove` — so this stays in-house rather than
 * adding `jotai-family` as a second Jotai package to keep version-aligned.
 * Dropping a key lets the store's WeakMap release that instance's state.
 */
type Family<AtomType> = ((id: TreeInstanceId) => AtomType) & {
  remove: (id: TreeInstanceId) => void
}

/** Every family, so `removeTreeInstance` can drop an id from all of them. */
const families: { remove: (id: TreeInstanceId) => void }[] = []

function keyed<AtomType>(create: (id: TreeInstanceId) => AtomType) {
  const cache = new Map<TreeInstanceId, AtomType>()
  const family = ((id: TreeInstanceId) => {
    let instance = cache.get(id)
    if (instance === undefined) {
      instance = create(id)
      cache.set(id, instance)
    }
    return instance
  }) as Family<AtomType>
  family.remove = (id: TreeInstanceId) => {
    cache.delete(id)
  }
  families.push(family)
  return family
}

function stateFamily<Value>(name: string, initialValue: Value) {
  return keyed((id) => {
    const instance = atom(initialValue)
    instance.debugLabel = `tree/${id}/${name}`
    return instance
  })
}

function readFamily<Value>(
  name: string,
  read: (get: Getter, id: TreeInstanceId) => Value
) {
  return keyed((id) => {
    const instance = atom((get) => read(get, id))
    instance.debugLabel = `tree/${id}/${name}`
    return instance
  })
}

function actionFamily<Args extends unknown[]>(
  name: string,
  write: (get: Getter, set: Setter, id: TreeInstanceId, ...args: Args) => void
) {
  return keyed((id) => {
    const instance = atom(null, (get, set, ...args: Args) =>
      write(get, set, id, ...args)
    )
    instance.debugLabel = `tree/${id}/${name}`
    return instance
  })
}

/**
 * A per-node derived atom, keyed by tree and then node id.
 *
 * This is where Jotai earns its place: a row subscribed to
 * `treeNodeExpandedAtom(treeId, node.id)` re-renders when *its* branch opens,
 * and stays put when a sibling's does. Reading the whole controller through
 * context instead re-rendered every row in the tree on every toggle.
 *
 * The outer family registers for cleanup, so `removeTreeInstance` drops all
 * of a tree's node atoms with it.
 */
function nodeFamily<Value>(
  name: string,
  read: (get: Getter, id: TreeInstanceId, nodeId: string) => Value
) {
  const outer = keyed((id: TreeInstanceId) => {
    const inner = new Map<string, Atom<Value>>()
    return (nodeId: string) => {
      let instance = inner.get(nodeId)
      if (instance === undefined) {
        instance = atom((get) => read(get, id, nodeId))
        instance.debugLabel = `tree/${id}/${name}/${nodeId}`
        inner.set(nodeId, instance)
      }
      return instance
    }
  })
  return (id: TreeInstanceId, nodeId: string) => outer(id)(nodeId)
}

// ── state ──────────────────────────────────────────────────────────────────

/** @internal */
export const treeConfigAtom = stateFamily<TreeConfig>(
  "config",
  DEFAULT_TREE_CONFIG
)
/** @internal Refreshed every commit; nothing subscribes, so it is free. */
export const treeHandlersAtom = stateFamily<TreeHandlers>(
  "handlers",
  NO_HANDLERS
)
const treeSeedAtom = stateFamily<TreeSeed>("seed", DEFAULT_TREE_SEED)
const treeInitializedAtom = stateFamily<boolean>("initialized", false)

/** The tree's current data — hook-owned, or the projection of a controlled
 * `items` prop. */
export const treeItemsAtom = stateFamily<TreeNode[]>("items", NO_ITEMS)
export const treeActiveIdAtom = stateFamily<string | undefined>(
  "activeId",
  undefined
)
export const treeExpandedIdsAtom = stateFamily<ReadonlySet<string>>(
  "expandedIds",
  NO_IDS
)
/** Raw rail fold. Read `treeCollapsedAtom` for the variant-masked value. */
export const treeRailCollapsedAtom = stateFamily<boolean>(
  "railCollapsed",
  false
)
export const treeRenamingIdAtom = stateFamily<string | null>("renamingId", null)
export const treeDraggedIdAtom = stateFamily<string | null>("draggedId", null)
export const treeDropTargetAtom = stateFamily<TreeDropTarget | null>(
  "dropTarget",
  null
)

// ── derived ────────────────────────────────────────────────────────────────

/** @internal The only items atom `useTree` may subscribe to: empty while a
 * controlled `items` prop owns the data, so the projection write never feeds
 * back into the render that produced it. An inline `items={[…]}` array is a
 * new reference every render, and a subscribed round-trip would loop. */
export const treeOwnedItemsAtom = readFamily("ownedItems", (get, id) =>
  get(treeConfigAtom(id)).controlsItems ? NO_ITEMS : get(treeItemsAtom(id))
)

/** Rail folded to icons — always `false` outside `sidebar`. */
export const treeCollapsedAtom = readFamily("collapsed", (get, id) =>
  get(treeConfigAtom(id)).variant === "sidebar"
    ? get(treeRailCollapsedAtom(id))
    : false
)

export const treeSectionedAtom = readFamily(
  "sectioned",
  (get, id) =>
    get(treeConfigAtom(id)).variant === "navigation" &&
    hasThreeLevels(get(treeItemsAtom(id)))
)

export const treeSectionIdsAtom = readFamily("sectionIds", (get, id) =>
  get(treeSectionedAtom(id))
    ? get(treeItemsAtom(id)).map((node) => node.id)
    : []
)

export const treeCanRenameAtom = readFamily("canRename", (get, id) => {
  const config = get(treeConfigAtom(id))
  return (
    config.variant === "files" &&
    (config.hasRenameHandler || config.managesItems)
  )
})

export const treeCanMoveAtom = readFamily("canMove", (get, id) => {
  const config = get(treeConfigAtom(id))
  return (
    config.variant === "files" && (config.hasMoveHandler || config.managesItems)
  )
})

export const treeVariantAtom = readFamily(
  "variant",
  (get, id) => get(treeConfigAtom(id)).variant
)

export const treeSoundAtom = readFamily(
  "sound",
  (get, id) => get(treeConfigAtom(id)).sound
)

/** Whether this one node's branch is open. */
export const treeNodeExpandedAtom = nodeFamily("expanded", (get, id, nodeId) =>
  get(treeExpandedIdsAtom(id)).has(nodeId)
)

/** Whether this one node is the current entry. */
export const treeNodeActiveAtom = nodeFamily(
  "active",
  (get, id, nodeId) => get(treeActiveIdAtom(id)) === nodeId
)

/** Whether this one node is in rename mode. */
export const treeNodeRenamingAtom = nodeFamily(
  "renaming",
  (get, id, nodeId) => get(treeRenamingIdAtom(id)) === nodeId
)

/** Whether this one node is the row in flight. */
export const treeNodeDraggingAtom = nodeFamily(
  "dragging",
  (get, id, nodeId) => get(treeDraggedIdAtom(id)) === nodeId
)

/** Where a drop on this one node would land, `null` when it is not hovered. */
export const treeNodeDropAtom = nodeFamily<TreeDropPosition | null>(
  "drop",
  (get, id, nodeId) => {
    const target = get(treeDropTargetAtom(id))
    return target?.id === nodeId ? target.position : null
  }
)

/** The whole state of one tree. Components reading a single field should
 * subscribe to that field's atom instead — this one changes on every edit. */
export const treeStateAtom = readFamily<TreeState>("state", (get, id) => ({
  variant: get(treeConfigAtom(id)).variant,
  items: get(treeItemsAtom(id)),
  activeId: get(treeActiveIdAtom(id)),
  expandedIds: get(treeExpandedIdsAtom(id)),
  collapsed: get(treeCollapsedAtom(id)),
  renamingId: get(treeRenamingIdAtom(id)),
  sectioned: get(treeSectionedAtom(id)),
  sectionIds: get(treeSectionIdsAtom(id)),
  canRename: get(treeCanRenameAtom(id)),
  canMove: get(treeCanMoveAtom(id)),
  draggedId: get(treeDraggedIdAtom(id)),
  dropTarget: get(treeDropTargetAtom(id)),
}))

// ── shared write helpers ───────────────────────────────────────────────────

function cue(get: Getter, id: TreeInstanceId): void {
  if (get(treeConfigAtom(id)).sound) playCue("toggle")
}

function commitExpanded(
  get: Getter,
  set: Setter,
  id: TreeInstanceId,
  next: Set<string>
): void {
  set(treeExpandedIdsAtom(id), next)
  get(treeHandlersAtom(id)).onExpandedChange?.([...next])
}

/** The atom only when the hook owns the data; the callback always. */
function commitItems(
  get: Getter,
  set: Setter,
  id: TreeInstanceId,
  next: TreeNode[]
): void {
  if (!get(treeConfigAtom(id)).controlsItems) set(treeItemsAtom(id), next)
  get(treeHandlersAtom(id)).onItemsChange?.(next)
}

/** `null` when every ancestor of `nodeId` is already open. */
function withAncestors(
  get: Getter,
  id: TreeInstanceId,
  nodeId: string
): Set<string> | null {
  const ancestors = ancestorIdsOf(get(treeItemsAtom(id)), nodeId)
  const expanded = get(treeExpandedIdsAtom(id))
  if (!ancestors.some((ancestor) => !expanded.has(ancestor))) return null
  return new Set([...expanded, ...ancestors])
}

function seedInstance(
  set: Setter,
  id: TreeInstanceId,
  seed: TreeSeed,
  variant: TreeVariant
): void {
  set(treeItemsAtom(id), seed.items)
  set(treeActiveIdAtom(id), seed.activeId)
  set(treeRailCollapsedAtom(id), seed.collapsed)
  set(treeRenamingIdAtom(id), null)
  set(treeDraggedIdAtom(id), null)
  set(treeDropTargetAtom(id), null)
  const expanded = seed.expandedIds
    ? new Set(seed.expandedIds)
    : initialExpandedIds(seed.items, seed.activeId)
  // Section names default open — they are headings over their run of items,
  // not drawers; `defaultOpen: false` still starts one closed.
  if (
    !seed.expandedIds &&
    variant === "navigation" &&
    hasThreeLevels(seed.items)
  )
    for (const node of seed.items)
      if (node.defaultOpen !== false) expanded.add(node.id)
  set(treeExpandedIdsAtom(id), expanded)
}

// ── expansion ──────────────────────────────────────────────────────────────

export const expandTreeNodeAtom = actionFamily<[nodeId: string]>(
  "expand",
  (get, set, id, nodeId) => {
    const expanded = get(treeExpandedIdsAtom(id))
    if (expanded.has(nodeId)) return
    commitExpanded(get, set, id, new Set([...expanded, nodeId]))
    cue(get, id)
  }
)

export const collapseTreeNodeAtom = actionFamily<[nodeId: string]>(
  "collapse",
  (get, set, id, nodeId) => {
    const expanded = get(treeExpandedIdsAtom(id))
    if (!expanded.has(nodeId)) return
    const next = new Set(expanded)
    next.delete(nodeId)
    commitExpanded(get, set, id, next)
    cue(get, id)
  }
)

export const toggleTreeNodeAtom = actionFamily<[nodeId: string]>(
  "toggleExpanded",
  (get, set, id, nodeId) => {
    const next = new Set(get(treeExpandedIdsAtom(id)))
    if (next.has(nodeId)) next.delete(nodeId)
    else next.add(nodeId)
    commitExpanded(get, set, id, next)
    cue(get, id)
  }
)

export const expandAllTreeNodesAtom = actionFamily<[]>(
  "expandAll",
  (get, set, id) => {
    const filesVariant = get(treeConfigAtom(id)).variant === "files"
    const ids = expandableIdsOf(get(treeItemsAtom(id)), filesVariant)
    commitExpanded(get, set, id, new Set(ids))
  }
)

export const collapseAllTreeNodesAtom = actionFamily<[]>(
  "collapseAll",
  (get, set, id) => {
    commitExpanded(get, set, id, new Set())
  }
)

/** Open every ancestor of `nodeId` without touching the rest of the tree. */
export const revealTreeNodeAtom = actionFamily<[nodeId: string]>(
  "reveal",
  (get, set, id, nodeId) => {
    const next = withAncestors(get, id, nodeId)
    if (next) commitExpanded(get, set, id, next)
  }
)

/** @internal The same, silent. `useTree` runs it whenever the active id
 * changes so a nested entry is never folded away — the hook has never
 * reported that implicit reveal through `onExpandedChange`. */
export const revealTreeAncestorsAtom = actionFamily<[nodeId: string]>(
  "revealAncestors",
  (get, set, id, nodeId) => {
    const next = withAncestors(get, id, nodeId)
    if (next) set(treeExpandedIdsAtom(id), next)
  }
)

// ── rail ───────────────────────────────────────────────────────────────────

export const setTreeCollapsedAtom = actionFamily<[collapsed: boolean]>(
  "setCollapsed",
  (get, set, id, collapsed) => {
    if (!get(treeConfigAtom(id)).controlsCollapsed)
      set(treeRailCollapsedAtom(id), collapsed)
    get(treeHandlersAtom(id)).onCollapsedChange?.(collapsed)
    cue(get, id)
  }
)

export const toggleTreeCollapsedAtom = actionFamily<[]>(
  "toggleCollapsed",
  (get, set, id) => {
    set(setTreeCollapsedAtom(id), !get(treeCollapsedAtom(id)))
  }
)

// ── selection ──────────────────────────────────────────────────────────────

/** Runs the node's own `onSelect` first, then `onNavigate` — the order a row
 * press follows. Disabled and unknown nodes are inert. */
export const selectTreeNodeAtom = actionFamily<[nodeId: string]>(
  "select",
  (get, set, id, nodeId) => {
    const node = findNode(get(treeItemsAtom(id)), nodeId)
    if (!node || node.disabled) return
    if (!get(treeConfigAtom(id)).controlsActiveId)
      set(treeActiveIdAtom(id), nodeId)
    node.onSelect?.()
    get(treeHandlersAtom(id)).onNavigate?.(node)
  }
)

// ── rename ─────────────────────────────────────────────────────────────────

export const startTreeRenameAtom = actionFamily<[nodeId: string]>(
  "startRename",
  (get, set, id, nodeId) => {
    // An id from elsewhere (a stale selection, another tree) would arm rename
    // mode against a row that never renders.
    if (!get(treeCanRenameAtom(id))) return
    if (!findNode(get(treeItemsAtom(id)), nodeId)) return
    set(treeRenamingIdAtom(id), nodeId)
  }
)

export const cancelTreeRenameAtom = actionFamily<[]>(
  "cancelRename",
  (_get, set, id) => {
    set(treeRenamingIdAtom(id), null)
  }
)

/** Commit a rename and leave rename mode. Blank or unchanged labels are
 * dropped. */
export const renameTreeNodeAtom = actionFamily<[nodeId: string, label: string]>(
  "rename",
  (get, set, id, nodeId, label) => {
    set(treeRenamingIdAtom(id), null)
    const next = label.trim()
    if (!get(treeCanRenameAtom(id)) || !next) return
    const items = get(treeItemsAtom(id))
    const node = findNode(items, nodeId)
    if (!node || node.label === next) return
    get(treeHandlersAtom(id)).onRename?.(nodeId, next)
    if (get(treeConfigAtom(id)).managesItems)
      commitItems(get, set, id, renameNode(items, nodeId, next))
  }
)

// ── data ───────────────────────────────────────────────────────────────────

export const moveTreeNodeAtom = actionFamily<
  [nodeId: string, parentId: string | null, index: number]
>("move", (get, set, id, nodeId, parentId, index) => {
  if (!get(treeCanMoveAtom(id))) return
  get(treeHandlersAtom(id)).onMove?.(nodeId, parentId, index)
  if (get(treeConfigAtom(id)).managesItems)
    commitItems(
      get,
      set,
      id,
      moveNode(get(treeItemsAtom(id)), nodeId, parentId, index)
    )
})

/** Replace the data. Reports through `onItemsChange`; writes the atom only
 * when no controlled `items` prop owns it. */
export const setTreeItemsAtom = actionFamily<[items: TreeNode[]]>(
  "setItems",
  (get, set, id, items) => {
    commitItems(get, set, id, items)
  }
)

// ── drag state ─────────────────────────────────────────────────────────────

export const endTreeDragAtom = actionFamily<[]>("endDrag", (_get, set, id) => {
  set(treeDraggedIdAtom(id), null)
  set(treeDropTargetAtom(id), null)
})

// ── lifecycle ──────────────────────────────────────────────────────────────

/** @internal Publish the latest options; seed the instance once. */
export const mountTreeAtom = actionFamily<[config: TreeConfig, seed: TreeSeed]>(
  "mount",
  (get, set, id, config, seed) => {
    set(treeConfigAtom(id), config)
    if (get(treeInitializedAtom(id))) return
    set(treeInitializedAtom(id), true)
    set(treeSeedAtom(id), seed)
    seedInstance(set, id, seed, config.variant)
  }
)

/** @internal */
export const setTreeHandlersAtom = actionFamily<[handlers: TreeHandlers]>(
  "setHandlers",
  (_get, set, id, handlers) => {
    set(treeHandlersAtom(id), handlers)
  }
)

/** @internal One-way projections of controlled props — no callbacks fire. */
export const projectTreeItemsAtom = actionFamily<[items: TreeNode[]]>(
  "projectItems",
  (_get, set, id, items) => {
    set(treeItemsAtom(id), items)
  }
)

/** @internal */
export const projectTreeActiveIdAtom = actionFamily<
  [activeId: string | undefined]
>("projectActiveId", (_get, set, id, activeId) => {
  set(treeActiveIdAtom(id), activeId)
})

/** @internal */
export const projectTreeCollapsedAtom = actionFamily<[collapsed: boolean]>(
  "projectCollapsed",
  (_get, set, id, collapsed) => {
    set(treeRailCollapsedAtom(id), collapsed)
  }
)

/** Back to the values the instance mounted with. */
export const resetTreeAtom = actionFamily<[]>("reset", (get, set, id) => {
  seedInstance(set, id, get(treeSeedAtom(id)), get(treeConfigAtom(id)).variant)
})

/** Drop every atom for `id`. `useTree` calls this on unmount for trees it
 * keyed itself; an explicit `treeId` outlives its component, so a rail's fold
 * survives a route change. */
export function removeTreeInstance(id: TreeInstanceId): void {
  for (const family of families) family.remove(id)
}
