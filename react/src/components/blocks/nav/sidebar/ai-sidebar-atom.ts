/**
 * Per-instance Jotai state for the AI sidebar.
 *
 * Every atom is a module-level family keyed by a sidebar id, so one
 * `ExegiaProvider` at the app root is enough: many sidebars coexist in one
 * store without a provider each, and any component can drive a sidebar by id
 * without holding its controller.
 *
 * Controlled props stay authoritative. `useAISidebar` projects them into
 * these atoms on every commit so the action atoms and remote readers work off
 * current data — a one-way projection, not a second source of truth. The
 * write gates below (`controlsItems`, `controlsActiveId`,
 * `controlsExpandedIds`) are what keep the store from overwriting a prop.
 *
 * DOM nodes are deliberately absent: the roving-focus ref map belongs to the
 * block that renders the rows, not to the store.
 */
import { atom } from "jotai";
import type { Atom, Getter, Setter } from "jotai";

import type {
  AISidebarConfig,
  AISidebarHandlers,
  AISidebarInstanceId,
  AISidebarSeed,
  AISidebarState,
  DropTarget,
  FlatResource,
  SidebarResource,
  SidebarResourceDropPosition,
  SidebarResourceMove,
} from "./type.ts";
import {
  ancestorIdsOf,
  expandableIdsOf,
  findResource,
  flattenResources,
  moveResource,
  renameResource,
} from "./utils.ts";

const NO_ITEMS: SidebarResource[] = [];
const NO_ROWS: FlatResource[] = [];
const NO_IDS: ReadonlySet<string> = new Set<string>();
const NO_HANDLERS: AISidebarHandlers = {};

/** What a sidebar reads as before `useAISidebar` publishes its options. */
export const DEFAULT_AI_SIDEBAR_CONFIG: AISidebarConfig = {
  controlsItems: false,
  controlsActiveId: false,
  controlsExpandedIds: false,
};

const DEFAULT_AI_SIDEBAR_SEED: AISidebarSeed = {
  items: NO_ITEMS,
  activeId: null,
  focusedId: null,
  expandedIds: [],
};

/**
 * A string-keyed atom family.
 *
 * `jotai/utils`' `atomFamily` is deprecated for Jotai v3, and we need only
 * the string-keyed case with a `remove` — so this stays in-house rather than
 * adding `jotai-family` as a second Jotai package to keep version-aligned.
 * Dropping a key lets the store's WeakMap release that instance's state.
 */
type Family<AtomType> = ((id: AISidebarInstanceId) => AtomType) & {
  remove: (id: AISidebarInstanceId) => void;
};

/** Every family, so `removeAISidebarInstance` can drop an id from all. */
const families: { remove: (id: AISidebarInstanceId) => void }[] = [];

function keyed<AtomType>(create: (id: AISidebarInstanceId) => AtomType) {
  const cache = new Map<AISidebarInstanceId, AtomType>();
  const family = ((id: AISidebarInstanceId) => {
    let instance = cache.get(id);
    if (instance === undefined) {
      instance = create(id);
      cache.set(id, instance);
    }
    return instance;
  }) as Family<AtomType>;
  family.remove = (id: AISidebarInstanceId) => {
    cache.delete(id);
  };
  families.push(family);
  return family;
}

function stateFamily<Value>(name: string, initialValue: Value) {
  return keyed((id) => {
    const instance = atom(initialValue);
    instance.debugLabel = `ai-sidebar/${id}/${name}`;
    return instance;
  });
}

function readFamily<Value>(
  name: string,
  read: (get: Getter, id: AISidebarInstanceId) => Value
) {
  return keyed((id) => {
    const instance = atom((get) => read(get, id));
    instance.debugLabel = `ai-sidebar/${id}/${name}`;
    return instance;
  });
}

function actionFamily<Args extends unknown[], Result = void>(
  name: string,
  write: (
    get: Getter,
    set: Setter,
    id: AISidebarInstanceId,
    ...args: Args
  ) => Result
) {
  return keyed((id) => {
    const instance = atom(null, (get, set, ...args: Args) =>
      write(get, set, id, ...args)
    );
    instance.debugLabel = `ai-sidebar/${id}/${name}`;
    return instance;
  });
}

/**
 * A per-row derived atom, keyed by sidebar and then row id.
 *
 * This is where Jotai earns its place: a row subscribed to
 * `aiSidebarRowExpandedAtom(sidebarId, row.item.id)` re-renders when *its*
 * branch opens and stays put when a sibling's does. Reading the whole
 * controller through props instead re-rendered every row on every hover.
 *
 * The outer family registers for cleanup, so `removeAISidebarInstance` drops
 * all of a sidebar's row atoms with it.
 */
function rowFamily<Value>(
  name: string,
  read: (get: Getter, id: AISidebarInstanceId, rowId: string) => Value
) {
  const outer = keyed((id: AISidebarInstanceId) => {
    const inner = new Map<string, Atom<Value>>();
    return (rowId: string) => {
      let instance = inner.get(rowId);
      if (instance === undefined) {
        instance = atom((get) => read(get, id, rowId));
        instance.debugLabel = `ai-sidebar/${id}/${name}/${rowId}`;
        inner.set(rowId, instance);
      }
      return instance;
    };
  });
  return (id: AISidebarInstanceId, rowId: string) => outer(id)(rowId);
}

// ── state ──────────────────────────────────────────────────────────────────

/** @internal */
export const aiSidebarConfigAtom = stateFamily<AISidebarConfig>(
  "config",
  DEFAULT_AI_SIDEBAR_CONFIG
);
/** @internal Refreshed every commit; nothing subscribes, so it is free. */
export const aiSidebarHandlersAtom = stateFamily<AISidebarHandlers>(
  "handlers",
  NO_HANDLERS
);
const aiSidebarSeedAtom = stateFamily<AISidebarSeed>(
  "seed",
  DEFAULT_AI_SIDEBAR_SEED
);
const aiSidebarInitializedAtom = stateFamily<boolean>("initialized", false);

/** The sidebar's current data — hook-owned, or the projection of a
 * controlled `items` prop. */
export const aiSidebarItemsAtom = stateFamily<SidebarResource[]>(
  "items",
  NO_ITEMS
);
/** @internal The hook-owned selection. `select` writes it only while no
 * `activeId` prop owns the selection — read `aiSidebarActiveIdAtom` for the
 * value the sidebar actually renders. */
export const aiSidebarOwnActiveIdAtom = stateFamily<string | null>(
  "ownActiveId",
  null
);
/** @internal Projection of a controlled `activeId` prop; `undefined` while
 * the selection is hook-owned. */
export const aiSidebarControlledActiveIdAtom = stateFamily<
  string | null | undefined
>("controlledActiveId", undefined);
/** Open rows — hook-owned, or the projection of a controlled `expandedIds`
 * prop. */
export const aiSidebarExpandedIdsAtom = stateFamily<ReadonlySet<string>>(
  "expandedIds",
  NO_IDS
);
/** Roving-focus target. DOM focus is moved by the block, which owns the row
 * refs; this is only which row is tabbable. */
export const aiSidebarFocusedIdAtom = stateFamily<string | null>(
  "focusedId",
  null
);
export const aiSidebarDraggingIdAtom = stateFamily<string | null>(
  "draggingId",
  null
);
export const aiSidebarDropTargetAtom = stateFamily<DropTarget | null>(
  "dropTarget",
  null
);
export const aiSidebarMenuOpenIdAtom = stateFamily<string | null>(
  "menuOpenId",
  null
);
export const aiSidebarRenamingIdAtom = stateFamily<string | null>(
  "renamingId",
  null
);
export const aiSidebarHoveredIdAtom = stateFamily<string | null>(
  "hoveredId",
  null
);
/** Live-region text for the last move or rename outcome. */
export const aiSidebarAnnouncementAtom = stateFamily<string>(
  "announcement",
  ""
);
/** A move is in flight. Read synchronously by `moveAISidebarRowAtom` before
 * it starts another — the store needs no ref to see its own latest write. */
export const aiSidebarMovePendingAtom = stateFamily<boolean>(
  "movePending",
  false
);

// ── derived ────────────────────────────────────────────────────────────────

/** @internal The only items atom `useAISidebar` may subscribe to: empty
 * while a controlled `items` prop owns the data, so the projection write
 * never feeds back into the render that produced it. An inline `items={[…]}`
 * array is a new reference every render, and a subscribed round-trip would
 * loop. */
export const aiSidebarOwnedItemsAtom = readFamily("ownedItems", (get, id) =>
  get(aiSidebarConfigAtom(id)).controlsItems
    ? NO_ITEMS
    : get(aiSidebarItemsAtom(id))
);

/** @internal The same guard for `expandedIds`, which is controllable here
 * and arrives as an array — just as unstable an identity as `items`. */
export const aiSidebarOwnedExpandedIdsAtom = readFamily(
  "ownedExpandedIds",
  (get, id) =>
    get(aiSidebarConfigAtom(id)).controlsExpandedIds
      ? NO_IDS
      : get(aiSidebarExpandedIdsAtom(id))
);

/** The selected row: the controlled `activeId` when there is one, the
 * hook-owned selection otherwise. Kept as two atoms because a controlled
 * `activeId` of `null` falls through to the hook-owned value — the block has
 * always read `activeId ?? internalActiveId`. */
export const aiSidebarActiveIdAtom = readFamily(
  "activeId",
  (get, id) =>
    get(aiSidebarControlledActiveIdAtom(id)) ??
    get(aiSidebarOwnActiveIdAtom(id))
);

/** Visible rows in order, each with its depth and parent id. */
export const aiSidebarFlatAtom = readFamily("flat", (get, id) => {
  const items = get(aiSidebarItemsAtom(id));
  if (items.length === 0) return NO_ROWS;
  return flattenResources(items, get(aiSidebarExpandedIdsAtom(id)));
});

/** Some row is hovered and no drag is running — mounts the pill wrapper. */
export const aiSidebarHoverActiveAtom = readFamily(
  "hoverActive",
  (get, id) =>
    get(aiSidebarHoveredIdAtom(id)) !== null &&
    get(aiSidebarDraggingIdAtom(id)) === null
);

/** Whether this one row is the current selection. */
export const aiSidebarRowSelectedAtom = rowFamily(
  "rowSelected",
  (get, id, rowId) => get(aiSidebarActiveIdAtom(id)) === rowId
);

/** Whether this one row is open. */
export const aiSidebarRowExpandedAtom = rowFamily(
  "rowExpanded",
  (get, id, rowId) => get(aiSidebarExpandedIdsAtom(id)).has(rowId)
);

/** Whether this one row is the roving-focus target. */
export const aiSidebarRowFocusedAtom = rowFamily(
  "rowFocused",
  (get, id, rowId) => get(aiSidebarFocusedIdAtom(id)) === rowId
);

/** Whether this one row is in rename mode. */
export const aiSidebarRowRenamingAtom = rowFamily(
  "rowRenaming",
  (get, id, rowId) => get(aiSidebarRenamingIdAtom(id)) === rowId
);

/** Whether this one row's action menu is open. */
export const aiSidebarRowMenuOpenAtom = rowFamily(
  "rowMenuOpen",
  (get, id, rowId) => get(aiSidebarMenuOpenIdAtom(id)) === rowId
);

/** Whether this one row is the row in flight. */
export const aiSidebarRowDraggingAtom = rowFamily(
  "rowDragging",
  (get, id, rowId) => get(aiSidebarDraggingIdAtom(id)) === rowId
);

/** Where a drop on this one row would land, `null` when it is not hovered
 * by a drag. */
export const aiSidebarRowDropAtom =
  rowFamily<SidebarResourceDropPosition | null>("rowDrop", (get, id, rowId) => {
    const target = get(aiSidebarDropTargetAtom(id));
    return target?.id === rowId ? target.position : null;
  });

/** Whether this one row owns the sliding hover pill. */
export const aiSidebarRowHoveredAtom = rowFamily(
  "rowHovered",
  (get, id, rowId) =>
    get(aiSidebarHoveredIdAtom(id)) === rowId &&
    get(aiSidebarDraggingIdAtom(id)) === null
);

/** The whole state of one sidebar. Components reading a single field should
 * subscribe to that field's atom instead — this one changes on every edit. */
export const aiSidebarStateAtom = readFamily<AISidebarState>(
  "state",
  (get, id) => ({
    items: get(aiSidebarItemsAtom(id)),
    flat: get(aiSidebarFlatAtom(id)),
    selectedId: get(aiSidebarActiveIdAtom(id)),
    expandedIds: get(aiSidebarExpandedIdsAtom(id)),
    focusedId: get(aiSidebarFocusedIdAtom(id)),
    renamingId: get(aiSidebarRenamingIdAtom(id)),
    menuOpenId: get(aiSidebarMenuOpenIdAtom(id)),
    draggingId: get(aiSidebarDraggingIdAtom(id)),
    dropTarget: get(aiSidebarDropTargetAtom(id)),
    hoveredId: get(aiSidebarHoveredIdAtom(id)),
    movePending: get(aiSidebarMovePendingAtom(id)),
    announcement: get(aiSidebarAnnouncementAtom(id)),
  })
);

// ── shared write helpers ───────────────────────────────────────────────────

/** The atom only when the hook owns the data; the callback always. */
function commitItems(
  get: Getter,
  set: Setter,
  id: AISidebarInstanceId,
  next: SidebarResource[]
): void {
  if (!get(aiSidebarConfigAtom(id)).controlsItems)
    set(aiSidebarItemsAtom(id), next);
  get(aiSidebarHandlersAtom(id)).onItemsChange?.(next);
}

function commitExpanded(
  get: Getter,
  set: Setter,
  id: AISidebarInstanceId,
  next: Set<string>
): void {
  if (!get(aiSidebarConfigAtom(id)).controlsExpandedIds)
    set(aiSidebarExpandedIdsAtom(id), next);
  get(aiSidebarHandlersAtom(id)).onExpandedChange?.([...next]);
}

function seedInstance(
  set: Setter,
  id: AISidebarInstanceId,
  seed: AISidebarSeed
): void {
  set(aiSidebarItemsAtom(id), seed.items);
  set(aiSidebarOwnActiveIdAtom(id), seed.activeId);
  set(aiSidebarFocusedIdAtom(id), seed.focusedId);
  set(aiSidebarExpandedIdsAtom(id), new Set(seed.expandedIds));
  set(aiSidebarRenamingIdAtom(id), null);
  set(aiSidebarMenuOpenIdAtom(id), null);
  set(aiSidebarDraggingIdAtom(id), null);
  set(aiSidebarDropTargetAtom(id), null);
  set(aiSidebarHoveredIdAtom(id), null);
  set(aiSidebarAnnouncementAtom(id), "");
  set(aiSidebarMovePendingAtom(id), false);
}

// ── expansion ──────────────────────────────────────────────────────────────

export const expandAISidebarRowAtom = actionFamily<[rowId: string]>(
  "expand",
  (get, set, id, rowId) => {
    const expanded = get(aiSidebarExpandedIdsAtom(id));
    if (expanded.has(rowId)) return;
    commitExpanded(get, set, id, new Set(expanded).add(rowId));
  }
);

export const collapseAISidebarRowAtom = actionFamily<[rowId: string]>(
  "collapse",
  (get, set, id, rowId) => {
    const expanded = get(aiSidebarExpandedIdsAtom(id));
    if (!expanded.has(rowId)) return;
    const next = new Set(expanded);
    next.delete(rowId);
    commitExpanded(get, set, id, next);
  }
);

export const toggleAISidebarRowAtom = actionFamily<[rowId: string]>(
  "toggleExpanded",
  (get, set, id, rowId) => {
    const next = new Set(get(aiSidebarExpandedIdsAtom(id)));
    if (next.has(rowId)) next.delete(rowId);
    else next.add(rowId);
    commitExpanded(get, set, id, next);
  }
);

export const expandAllAISidebarRowsAtom = actionFamily<[]>(
  "expandAll",
  (get, set, id) => {
    commitExpanded(
      get,
      set,
      id,
      new Set(expandableIdsOf(get(aiSidebarItemsAtom(id))))
    );
  }
);

export const collapseAllAISidebarRowsAtom = actionFamily<[]>(
  "collapseAll",
  (get, set, id) => {
    commitExpanded(get, set, id, new Set());
  }
);

/** Open every ancestor of `rowId` without touching the rest of the tree. */
export const revealAISidebarRowAtom = actionFamily<[rowId: string]>(
  "reveal",
  (get, set, id, rowId) => {
    const ancestors = ancestorIdsOf(get(aiSidebarItemsAtom(id)), rowId);
    const expanded = get(aiSidebarExpandedIdsAtom(id));
    if (!ancestors.some((ancestor) => !expanded.has(ancestor))) return;
    commitExpanded(get, set, id, new Set([...expanded, ...ancestors]));
  }
);

// ── selection and focus ────────────────────────────────────────────────────

export const selectAISidebarRowAtom = actionFamily<[rowId: string]>(
  "select",
  (get, set, id, rowId) => {
    if (!get(aiSidebarConfigAtom(id)).controlsActiveId)
      set(aiSidebarOwnActiveIdAtom(id), rowId);
    get(aiSidebarHandlersAtom(id)).onActiveChange?.(rowId);
  }
);

/** The store half of `focus`: which row is tabbable. Moving DOM focus is the
 * block's job — it owns the row refs. */
export const focusAISidebarRowAtom = actionFamily<[rowId: string]>(
  "focus",
  (_get, set, id, rowId) => {
    set(aiSidebarFocusedIdAtom(id), rowId);
  }
);

/** @internal Keeps the roving target on a row that still renders: a focused
 * row that folds away hands focus to the first visible row instead of
 * pointing at nothing. `useAISidebar` runs it after every projection. */
export const normalizeAISidebarFocusAtom = actionFamily<[]>(
  "normalizeFocus",
  (get, set, id) => {
    const flat = get(aiSidebarFlatAtom(id));
    const focusedId = get(aiSidebarFocusedIdAtom(id));
    if (focusedId !== null && flat.some((row) => row.item.id === focusedId))
      return;
    const first = flat[0]?.item.id ?? null;
    if (focusedId !== first) set(aiSidebarFocusedIdAtom(id), first);
  }
);

// ── rename ─────────────────────────────────────────────────────────────────

export const startAISidebarRenameAtom = actionFamily<[rowId: string]>(
  "startRename",
  (get, set, id, rowId) => {
    // An id from elsewhere (a stale selection, another sidebar) would arm
    // rename mode against a row that never renders.
    if (!findResource(get(aiSidebarItemsAtom(id)), rowId)) return;
    set(aiSidebarRenamingIdAtom(id), rowId);
  }
);

export const cancelAISidebarRenameAtom = actionFamily<[]>(
  "cancelRename",
  (_get, set, id) => {
    set(aiSidebarRenamingIdAtom(id), null);
  }
);

/** Commit a rename and leave rename mode. Applied optimistically and rolled
 * back if `onRename` rejects. Blank and unchanged labels are dropped. */
export const renameAISidebarRowAtom = actionFamily<
  [rowId: string, label: string]
>("rename", (get, set, id, rowId, label) => {
  const trimmed = label.trim();
  set(aiSidebarRenamingIdAtom(id), null);
  const before = get(aiSidebarItemsAtom(id));
  const item = findResource(before, rowId);
  if (!item || !trimmed || trimmed === item.label) return;
  commitItems(get, set, id, renameResource(before, rowId, trimmed));
  void Promise.resolve(
    get(aiSidebarHandlersAtom(id)).onRename?.(item, trimmed)
  ).catch(() => {
    commitItems(get, set, id, before);
    set(
      aiSidebarAnnouncementAtom(id),
      `Rename failed. ${item.label} was restored.`
    );
  });
});

// ── menu ───────────────────────────────────────────────────────────────────

export const openAISidebarMenuAtom = actionFamily<[rowId: string]>(
  "openMenu",
  (get, set, id, rowId) => {
    if (!findResource(get(aiSidebarItemsAtom(id)), rowId)) return;
    set(aiSidebarMenuOpenIdAtom(id), rowId);
  }
);

/** Closes the menu and hands the roving target back to the row that owned
 * it, then returns that id so the block can move DOM focus there — otherwise
 * focus falls back to the body and the keyboard user loses their place. */
export const closeAISidebarMenuAtom = actionFamily<[], string | null>(
  "closeMenu",
  (get, set, id) => {
    const current = get(aiSidebarMenuOpenIdAtom(id));
    set(aiSidebarMenuOpenIdAtom(id), null);
    if (current) set(aiSidebarFocusedIdAtom(id), current);
    return current;
  }
);

// ── data ───────────────────────────────────────────────────────────────────

/**
 * Reorder, applied optimistically and rolled back if `onMove` rejects.
 *
 * The pending flag is read straight back out of the store, which is why this
 * needs no ref to guard overlapping moves the way React state did: the write
 * is visible to the next call immediately, not after a commit.
 */
export const moveAISidebarRowAtom = actionFamily<
  [move: SidebarResourceMove],
  Promise<void>
>("move", async (get, set, id, move) => {
  if (get(aiSidebarMovePendingAtom(id))) {
    set(aiSidebarAnnouncementAtom(id), "Wait for the current move to finish.");
    return;
  }
  const before = get(aiSidebarItemsAtom(id));
  const next = moveResource(before, move);
  if (!next || next === before) return;

  set(aiSidebarMovePendingAtom(id), true);
  commitItems(get, set, id, next);
  set(aiSidebarDropTargetAtom(id), null);
  set(aiSidebarDraggingIdAtom(id), null);
  const moved = findResource(before, move.itemId);
  const target = move.targetId ? findResource(before, move.targetId) : null;
  set(
    aiSidebarAnnouncementAtom(id),
    target
      ? `Moved ${moved?.label ?? "item"} ${move.position} ${target.label}.`
      : `Moved ${moved?.label ?? "item"} to the top level.`
  );

  try {
    await get(aiSidebarHandlersAtom(id)).onMove?.(move);
  } catch (error) {
    commitItems(get, set, id, before);
    set(
      aiSidebarAnnouncementAtom(id),
      `Move failed. ${moved?.label ?? "Item"} was restored.`
    );
    get(aiSidebarHandlersAtom(id)).onMoveError?.(error, move);
  } finally {
    set(aiSidebarMovePendingAtom(id), false);
  }
});

/** Replace the data. Reports through `onItemsChange`; writes the atom only
 * when no controlled `items` prop owns it. */
export const setAISidebarItemsAtom = actionFamily<[items: SidebarResource[]]>(
  "setItems",
  (get, set, id, items) => {
    commitItems(get, set, id, items);
  }
);

// ── hover and drag state ───────────────────────────────────────────────────

export const setAISidebarHoveredAtom = actionFamily<
  [rowId: string, hovered: boolean]
>("setHovered", (get, set, id, rowId, hovered) => {
  const current = get(aiSidebarHoveredIdAtom(id));
  const next = hovered ? rowId : current === rowId ? null : current;
  if (next !== current) set(aiSidebarHoveredIdAtom(id), next);
});

export const clearAISidebarHoverAtom = actionFamily<[]>(
  "clearHover",
  (_get, set, id) => {
    set(aiSidebarHoveredIdAtom(id), null);
  }
);

export const endAISidebarDragAtom = actionFamily<[]>(
  "endDrag",
  (_get, set, id) => {
    set(aiSidebarDraggingIdAtom(id), null);
    set(aiSidebarDropTargetAtom(id), null);
  }
);

// ── lifecycle ──────────────────────────────────────────────────────────────

/** @internal Publish the latest options; seed the instance once. */
export const mountAISidebarAtom = actionFamily<
  [config: AISidebarConfig, seed: AISidebarSeed]
>("mount", (get, set, id, config, seed) => {
  set(aiSidebarConfigAtom(id), config);
  if (get(aiSidebarInitializedAtom(id))) return;
  set(aiSidebarInitializedAtom(id), true);
  set(aiSidebarSeedAtom(id), seed);
  seedInstance(set, id, seed);
});

/** @internal */
export const setAISidebarHandlersAtom = actionFamily<
  [handlers: AISidebarHandlers]
>("setHandlers", (_get, set, id, handlers) => {
  set(aiSidebarHandlersAtom(id), handlers);
});

/** @internal One-way projections of controlled props — no callbacks fire. */
export const projectAISidebarItemsAtom = actionFamily<
  [items: SidebarResource[]]
>("projectItems", (_get, set, id, items) => {
  set(aiSidebarItemsAtom(id), items);
});

/** @internal */
export const projectAISidebarActiveIdAtom = actionFamily<
  [activeId: string | null]
>("projectActiveId", (_get, set, id, activeId) => {
  set(aiSidebarControlledActiveIdAtom(id), activeId);
});

/** @internal */
export const projectAISidebarExpandedIdsAtom = actionFamily<
  [expandedIds: string[]]
>("projectExpandedIds", (_get, set, id, expandedIds) => {
  set(aiSidebarExpandedIdsAtom(id), new Set(expandedIds));
});

/** Back to the values the instance mounted with. */
export const resetAISidebarAtom = actionFamily<[]>("reset", (get, set, id) => {
  seedInstance(set, id, get(aiSidebarSeedAtom(id)));
});

/** Drop every atom for `id`. `useAISidebar` calls this on unmount for
 * sidebars it keyed itself; an explicit `sidebarId` outlives its component,
 * so an app-named sidebar keeps its open rows across a route change. */
export function removeAISidebarInstance(id: AISidebarInstanceId): void {
  for (const family of families) family.remove(id);
}
