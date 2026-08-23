"use client";

import {
  type DragEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAtomValue, useSetAtom, useStore } from "jotai";

import {
  aiSidebarAnnouncementAtom,
  aiSidebarDraggingIdAtom,
  aiSidebarDropTargetAtom,
  aiSidebarExpandedIdsAtom,
  aiSidebarFlatAtom,
  aiSidebarFocusedIdAtom,
  aiSidebarHoveredIdAtom,
  aiSidebarItemsAtom,
  aiSidebarMenuOpenIdAtom,
  aiSidebarMovePendingAtom,
  aiSidebarOwnActiveIdAtom,
  aiSidebarOwnedExpandedIdsAtom,
  aiSidebarOwnedItemsAtom,
  aiSidebarRenamingIdAtom,
  cancelAISidebarRenameAtom,
  clearAISidebarHoverAtom,
  closeAISidebarMenuAtom,
  collapseAISidebarRowAtom,
  collapseAllAISidebarRowsAtom,
  endAISidebarDragAtom,
  expandAISidebarRowAtom,
  expandAllAISidebarRowsAtom,
  focusAISidebarRowAtom,
  mountAISidebarAtom,
  moveAISidebarRowAtom,
  normalizeAISidebarFocusAtom,
  openAISidebarMenuAtom,
  projectAISidebarActiveIdAtom,
  projectAISidebarExpandedIdsAtom,
  projectAISidebarItemsAtom,
  removeAISidebarInstance,
  renameAISidebarRowAtom,
  resetAISidebarAtom,
  revealAISidebarRowAtom,
  selectAISidebarRowAtom,
  setAISidebarHandlersAtom,
  setAISidebarHoveredAtom,
  startAISidebarRenameAtom,
  toggleAISidebarRowAtom,
} from "./ai-sidebar-atom.ts";
import type {
  AISidebarConfig,
  AISidebarController,
  AISidebarHandlers,
  AISidebarSeed,
  FlatResource,
  UseAISidebarOptions,
} from "./type.ts";
import {
  canContain,
  containsResource,
  findResource,
  flattenResources,
} from "./utils.ts";

export type { UseAISidebarOptions };

/**
 * The AI sidebar's headless controller — every behaviour the block
 * performs, callable from outside it: select, expand/collapse (one row,
 * every row, or just the ancestors of one), move focus, rename, open a
 * row's action menu, reorder.
 *
 * `items`, `activeId` and `expandedIds` are each controlled when passed
 * and hook-owned via their `default*` twin otherwise. Reorder and rename
 * are applied to the data optimistically and rolled back if
 * `onMove`/`onRename` rejects, so a consumer never reduces the tree
 * itself — `moveResource` and `renameResource` are exported for the ones
 * who keep their data elsewhere.
 *
 * ```tsx
 * const sidebar = useAISidebar({ defaultItems: resources })
 * <AISidebar controller={sidebar} />
 * <Button onClick={sidebar.collapseAll}>Collapse all</Button>
 * ```
 *
 * State lives in Jotai atoms keyed by `sidebarId`, so anything under
 * `ExegiaProvider` can drive this sidebar without the controller — name it
 * and reach for `useAISidebarState(sidebarId)` /
 * `useAISidebarActions(sidebarId)` elsewhere.
 */
export function useAISidebar(
  options: UseAISidebarOptions
): AISidebarController {
  const {
    items,
    defaultItems = [],
    onItemsChange,
    onMove,
    onMoveError,
    onRename,
    activeId,
    defaultActiveId = null,
    onActiveChange,
    onExpandedChange,
  } = options;

  // A generated key isolates unnamed sidebars from each other; an explicit
  // `sidebarId` is the app's handle on this one.
  const generatedId = useId();
  const sidebarId = options.sidebarId ?? generatedId;
  const store = useStore();
  const hoverLayoutId = useId();

  const controlledExpandedIds = options.expandedIds;
  const controlsItems = items !== undefined;
  const controlsActiveId = activeId !== undefined;
  const controlsExpandedIds = controlledExpandedIds !== undefined;

  // Primitives only, so this object is stable and the store write below runs
  // once per real change rather than once per render.
  const config = useMemo<AISidebarConfig>(
    () => ({ controlsItems, controlsActiveId, controlsExpandedIds }),
    [controlsActiveId, controlsExpandedIds, controlsItems]
  );

  const handlers = useMemo<AISidebarHandlers>(
    () => ({
      onItemsChange,
      onMove,
      onMoveError,
      onRename,
      onActiveChange,
      onExpandedChange,
    }),
    [
      onActiveChange,
      onExpandedChange,
      onItemsChange,
      onMove,
      onMoveError,
      onRename,
    ]
  );

  // Read once: the `default*` options describe the mount, not every render.
  const [seed] = useState<AISidebarSeed>(() => ({
    items: items ?? defaultItems,
    activeId: defaultActiveId,
    focusedId: activeId ?? defaultActiveId,
    expandedIds: [
      ...(controlledExpandedIds ?? options.defaultExpandedIds ?? []),
    ],
  }));

  const mount = useSetAtom(mountAISidebarAtom(sidebarId));
  const publishHandlers = useSetAtom(setAISidebarHandlersAtom(sidebarId));
  const projectItems = useSetAtom(projectAISidebarItemsAtom(sidebarId));
  const projectActiveId = useSetAtom(projectAISidebarActiveIdAtom(sidebarId));
  const projectExpandedIds = useSetAtom(
    projectAISidebarExpandedIdsAtom(sidebarId)
  );
  const normalizeFocus = useSetAtom(normalizeAISidebarFocusAtom(sidebarId));

  // Handlers first — they must be in the store before any action can fire.
  // Rewritten every commit; no read atom depends on them, so nobody
  // re-renders for it.
  useLayoutEffect(() => {
    publishHandlers(handlers);
  }, [handlers, publishHandlers]);

  // Before paint, so a seeded row never paints closed for a frame.
  useLayoutEffect(() => {
    mount(config, seed);
  }, [config, mount, seed]);

  // Controlled props stay the source of truth; the store carries a projection
  // so the action atoms and remote readers see current data.
  useLayoutEffect(() => {
    if (items !== undefined) projectItems(items);
  }, [items, projectItems]);

  useLayoutEffect(() => {
    if (activeId !== undefined) projectActiveId(activeId);
  }, [activeId, projectActiveId]);

  useLayoutEffect(() => {
    if (controlledExpandedIds !== undefined)
      projectExpandedIds(controlledExpandedIds);
  }, [controlledExpandedIds, projectExpandedIds]);

  // A sidebar the hook keyed is scrap once its component goes. An explicit
  // `sidebarId` is the app's key and outlives the mount.
  useEffect(() => {
    if (options.sidebarId !== undefined) return;
    return () => removeAISidebarInstance(sidebarId);
  }, [options.sidebarId, sidebarId]);

  // Never `aiSidebarItemsAtom` — see the note on `aiSidebarOwnedItemsAtom`.
  const ownedItems = useAtomValue(aiSidebarOwnedItemsAtom(sidebarId));
  const renderedItems = items ?? ownedItems;
  // `activeId ?? own` rather than the projected atom: a controlled `activeId`
  // of `null` has always fallen through to the hook-owned selection.
  const ownActiveId = useAtomValue(aiSidebarOwnActiveIdAtom(sidebarId));
  const selectedId = activeId ?? ownActiveId;
  const ownExpandedIds = useAtomValue(aiSidebarOwnedExpandedIdsAtom(sidebarId));
  const expandedIds = useMemo(
    () =>
      controlledExpandedIds ? new Set(controlledExpandedIds) : ownExpandedIds,
    [controlledExpandedIds, ownExpandedIds]
  );
  const focusedId = useAtomValue(aiSidebarFocusedIdAtom(sidebarId));
  const renamingId = useAtomValue(aiSidebarRenamingIdAtom(sidebarId));
  const menuOpenId = useAtomValue(aiSidebarMenuOpenIdAtom(sidebarId));
  const draggingId = useAtomValue(aiSidebarDraggingIdAtom(sidebarId));
  const dropTarget = useAtomValue(aiSidebarDropTargetAtom(sidebarId));
  const hoveredId = useAtomValue(aiSidebarHoveredIdAtom(sidebarId));
  const announcement = useAtomValue(aiSidebarAnnouncementAtom(sidebarId));
  const movePending = useAtomValue(aiSidebarMovePendingAtom(sidebarId));

  const flat = useMemo(
    () => flattenResources(renderedItems, expandedIds),
    [expandedIds, renderedItems]
  );

  // The roving target must name a row that still renders: one that folds away
  // hands focus to the first visible row instead of pointing at nothing. Last
  // of the layout effects, so it reads the projections this commit wrote.
  useLayoutEffect(() => {
    normalizeFocus();
  }, [flat, focusedId, normalizeFocus]);

  useEffect(() => {
    if (!menuOpenId) return;
    const frame = requestAnimationFrame(() => {
      const menus = Array.from(
        document.querySelectorAll<HTMLElement>("[data-sidebar-resource-menu]")
      );
      menus
        .find((menu) => menu.dataset.sidebarResourceMenu === menuOpenId)
        ?.querySelector<HTMLElement>("button, a[href]")
        ?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [menuOpenId]);

  const getItem = useCallback(
    (id: string) => findResource(renderedItems, id),
    [renderedItems]
  );

  const isExpanded = useCallback(
    (id: string) => expandedIds.has(id),
    [expandedIds]
  );

  // `useSetAtom` setters are already stable — no useCallback needed.
  const select = useSetAtom(selectAISidebarRowAtom(sidebarId));
  const expand = useSetAtom(expandAISidebarRowAtom(sidebarId));
  const collapse = useSetAtom(collapseAISidebarRowAtom(sidebarId));
  const toggleExpanded = useSetAtom(toggleAISidebarRowAtom(sidebarId));
  const expandAll = useSetAtom(expandAllAISidebarRowsAtom(sidebarId));
  const collapseAll = useSetAtom(collapseAllAISidebarRowsAtom(sidebarId));
  const reveal = useSetAtom(revealAISidebarRowAtom(sidebarId));
  const startRename = useSetAtom(startAISidebarRenameAtom(sidebarId));
  const cancelRename = useSetAtom(cancelAISidebarRenameAtom(sidebarId));
  const rename = useSetAtom(renameAISidebarRowAtom(sidebarId));
  const openMenu = useSetAtom(openAISidebarMenuAtom(sidebarId));
  const closeMenuInStore = useSetAtom(closeAISidebarMenuAtom(sidebarId));
  const move = useSetAtom(moveAISidebarRowAtom(sidebarId));
  const reset = useSetAtom(resetAISidebarAtom(sidebarId));
  const setFocusedRow = useSetAtom(focusAISidebarRowAtom(sidebarId));
  const onRowHover = useSetAtom(setAISidebarHoveredAtom(sidebarId));
  const clearHover = useSetAtom(clearAISidebarHoverAtom(sidebarId));
  const onRowDragEnd = useSetAtom(endAISidebarDragAtom(sidebarId));
  const setDraggingId = useSetAtom(aiSidebarDraggingIdAtom(sidebarId));
  const setDropTarget = useSetAtom(aiSidebarDropTargetAtom(sidebarId));

  // The one piece of row state that cannot live in the store: these are DOM
  // nodes. The block owns them, and every DOM focus move goes through here.
  const rowRefs = useRef(new Map<string, HTMLDivElement>());

  const setRowRef = useCallback((id: string, node: HTMLDivElement | null) => {
    if (node) rowRefs.current.set(id, node);
    else rowRefs.current.delete(id);
  }, []);

  const focusRow = useCallback((id: string) => {
    requestAnimationFrame(() => rowRefs.current.get(id)?.focus());
  }, []);

  const focus = useCallback(
    (id: string) => {
      setFocusedRow(id);
      focusRow(id);
    },
    [focusRow, setFocusedRow]
  );

  // Closing returns focus to the row that owned the menu — otherwise focus
  // falls back to the body and the keyboard user loses their place. The atom
  // hands back the id it closed so only the DOM half happens here.
  const closeMenu = useCallback(() => {
    const closed = closeMenuInStore();
    if (closed) focusRow(closed);
  }, [closeMenuInStore, focusRow]);

  // Roving nav reads the visible rows out of the store when a key lands
  // rather than closing over them, so one stable handler serves every row.
  const readFlat = useCallback(
    () => store.get(aiSidebarFlatAtom(sidebarId)),
    [sidebarId, store]
  );

  const onRowKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>, row: FlatResource) => {
      const flatRows = readFlat();
      const expanded = store.get(aiSidebarExpandedIdsAtom(sidebarId));
      const index = flatRows.findIndex(({ item }) => item.id === row.item.id);
      const previous = flatRows[index - 1];
      const next = flatRows[index + 1];
      const moveModifier = event.altKey && event.shiftKey;

      if (event.key === "ArrowDown" && !moveModifier && next) {
        event.preventDefault();
        focus(next.item.id);
        return;
      }
      if (event.key === "ArrowUp" && !moveModifier && previous) {
        event.preventDefault();
        focus(previous.item.id);
        return;
      }
      if (event.key === "Home" && flatRows[0]) {
        event.preventDefault();
        focus(flatRows[0].item.id);
        return;
      }
      if (event.key === "End" && flatRows.at(-1)) {
        event.preventDefault();
        focus(flatRows.at(-1)?.item.id ?? row.item.id);
        return;
      }

      if (row.item.disabled) {
        if (event.key === "ArrowLeft" && row.parentId) {
          event.preventDefault();
          focus(row.parentId);
        } else if (
          moveModifier ||
          ["ArrowRight", "Enter", " ", "F2", "ContextMenu"].includes(
            event.key
          ) ||
          (event.shiftKey && event.key === "F10")
        ) {
          event.preventDefault();
        }
        return;
      }

      if (moveModifier && event.key === "ArrowUp" && previous) {
        event.preventDefault();
        void move({
          itemId: row.item.id,
          targetId: previous.item.id,
          position: "before",
        });
        return;
      }
      if (moveModifier && event.key === "ArrowDown" && next) {
        event.preventDefault();
        void move({
          itemId: row.item.id,
          targetId: next.item.id,
          position: "after",
        });
        return;
      }
      if (
        moveModifier &&
        event.key === "ArrowRight" &&
        previous &&
        canContain(previous.item)
      ) {
        event.preventDefault();
        expand(previous.item.id);
        void move({
          itemId: row.item.id,
          targetId: previous.item.id,
          position: "inside",
        });
        return;
      }
      if (moveModifier && event.key === "ArrowLeft" && row.parentId) {
        event.preventDefault();
        void move({
          itemId: row.item.id,
          targetId: row.parentId,
          position: "after",
        });
        return;
      }

      if (event.key === "ArrowRight" && canContain(row.item)) {
        event.preventDefault();
        if (!expanded.has(row.item.id)) expand(row.item.id);
        else if (next?.parentId === row.item.id) focus(next.item.id);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (expanded.has(row.item.id)) collapse(row.item.id);
        else if (row.parentId) focus(row.parentId);
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (canContain(row.item)) toggleExpanded(row.item.id);
        else select(row.item.id);
      } else if (event.key === "F2") {
        event.preventDefault();
        startRename(row.item.id);
      } else if (
        event.key === "ContextMenu" ||
        (event.shiftKey && event.key === "F10")
      ) {
        event.preventDefault();
        openMenu(row.item.id);
      }
    },
    [
      collapse,
      expand,
      focus,
      move,
      openMenu,
      readFlat,
      select,
      sidebarId,
      startRename,
      store,
      toggleExpanded,
    ]
  );

  // The drag handlers read drag state out of the store when they run instead
  // of closing over it. That is what keeps them stable for the life of the
  // sidebar, so every row can share one set without re-rendering on a drag.
  const onRootDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (
        !store.get(aiSidebarDraggingIdAtom(sidebarId)) ||
        event.target !== event.currentTarget
      )
        return;
      event.preventDefault();
      setDropTarget({ id: null, position: "after" });
    },
    [setDropTarget, sidebarId, store]
  );

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const dragging = store.get(aiSidebarDraggingIdAtom(sidebarId));
      const target = store.get(aiSidebarDropTargetAtom(sidebarId));
      if (dragging && target) {
        void move({
          itemId: dragging,
          targetId: target.id,
          position: target.position,
        });
      }
    },
    [move, sidebarId, store]
  );

  const onRowDragStart = useCallback(
    (event: DragEvent<HTMLDivElement>, id: string) => {
      setDraggingId(id);
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", id);
    },
    [setDraggingId]
  );

  const onRowDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>, targetRow: FlatResource) => {
      const dragging = store.get(aiSidebarDraggingIdAtom(sidebarId));
      if (!dragging || dragging === targetRow.item.id) return;
      const source = findResource(
        store.get(aiSidebarItemsAtom(sidebarId)),
        dragging
      );
      if (source && containsResource(source, targetRow.item.id)) return;
      event.preventDefault();
      event.stopPropagation();
      const rect = event.currentTarget.getBoundingClientRect();
      const ratio = (event.clientY - rect.top) / rect.height;
      const position =
        !targetRow.item.disabled &&
        canContain(targetRow.item) &&
        ratio >= 0.25 &&
        ratio <= 0.75
          ? "inside"
          : ratio < 0.5
            ? "before"
            : "after";
      setDropTarget({ id: targetRow.item.id, position });
    },
    [setDropTarget, sidebarId, store]
  );

  const dnd = useMemo(
    () => ({
      draggingId,
      dropTarget,
      onRootDragOver,
      onDrop,
      onRowDragStart,
      onRowDragEnd,
      onRowDragOver,
    }),
    [
      draggingId,
      dropTarget,
      onRootDragOver,
      onDrop,
      onRowDragStart,
      onRowDragEnd,
      onRowDragOver,
    ]
  );

  const hover = useMemo(
    () => ({
      hoveredId,
      layoutId: hoverLayoutId,
      onRowHover,
      clear: clearHover,
    }),
    [clearHover, hoverLayoutId, hoveredId, onRowHover]
  );

  return useMemo<AISidebarController>(
    () => ({
      sidebarId,
      items: renderedItems,
      flat,
      getItem,
      selectedId,
      select,
      expandedIds,
      isExpanded,
      expand,
      collapse,
      toggleExpanded,
      expandAll,
      collapseAll,
      reveal,
      focusedId,
      focus,
      renamingId,
      startRename,
      cancelRename,
      rename,
      menuOpenId,
      openMenu,
      closeMenu,
      move,
      movePending,
      announcement,
      reset,
      dnd,
      hover,
      onRowKeyDown,
      setRowRef,
    }),
    [
      sidebarId,
      renderedItems,
      flat,
      getItem,
      selectedId,
      select,
      expandedIds,
      isExpanded,
      expand,
      collapse,
      toggleExpanded,
      expandAll,
      collapseAll,
      reveal,
      focusedId,
      focus,
      renamingId,
      startRename,
      cancelRename,
      rename,
      menuOpenId,
      openMenu,
      closeMenu,
      move,
      movePending,
      announcement,
      reset,
      dnd,
      hover,
      onRowKeyDown,
      setRowRef,
    ]
  );
}
