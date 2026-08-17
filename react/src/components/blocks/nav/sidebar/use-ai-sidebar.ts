"use client";

import {
  type DragEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  AISidebarController,
  DropTarget,
  FlatResource,
  SidebarResource,
  SidebarResourceMove,
  UseAISidebarOptions,
} from "./type.ts"
import {
  ancestorIdsOf,
  canContain,
  containsResource,
  expandableIdsOf,
  findResource,
  flattenResources,
  moveResource,
  renameResource,
} from "./utils.ts"

export type { UseAISidebarOptions }

/**
 * The AI sidebar's headless controller — every behaviour the block
 * performs, callable from outside it: select, expand/collapse (one row,
 * every row, or just the ancestors of one), move focus, rename, open a
 * row's action menu, reorder.
 *
 * `items`, `activeId` and `expandedIds` are each controlled when passed
 * and hook-owned via their `default*` twin otherwise. Reorder and rename
 * are applied to the data optimistically either way and rolled back if
 * `onMove`/`onRename` rejects, so a consumer never reduces the tree
 * itself — `moveResource` and `renameResource` are exported for the ones
 * who keep their data elsewhere.
 *
 * ```tsx
 * const sidebar = useAISidebar({ defaultItems: resources })
 * <AISidebar controller={sidebar} />
 * <Button onClick={sidebar.collapseAll}>Collapse all</Button>
 * ```
 */
export function useAISidebar(options: UseAISidebarOptions): AISidebarController {
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
  } = options

  const [internalItems, setInternalItems] = useState(items ?? defaultItems);
  const [internalActiveId, setInternalActiveId] = useState(defaultActiveId);
  const [ownExpandedIds, setOwnExpandedIds] = useState(
    () => new Set(options.defaultExpandedIds ?? []),
  );
  const [focusedId, setFocusedId] = useState<string | null>(
    activeId ?? defaultActiveId,
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hoverLayoutId = useId();
  const [announcement, setAnnouncement] = useState("");
  // `movePending` is mirrored in a ref because the guard has to read it
  // synchronously, before React has committed the state change.
  const [movePending, setMovePending] = useState(false);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const movePendingRef = useRef(false);
  const renderedItems = internalItems;
  const selectedId = activeId ?? internalActiveId;

  const controlledExpandedIds = options.expandedIds
  const expandedIds = useMemo(
    () => (controlledExpandedIds ? new Set(controlledExpandedIds) : ownExpandedIds),
    [controlledExpandedIds, ownExpandedIds],
  )

  const [prevItems, setPrevItems] = useState(items);
  if (items !== prevItems) {
    setPrevItems(items);
    if (items) setInternalItems(items);
  }

  const flat = useMemo(
    () => flattenResources(renderedItems, expandedIds),
    [expandedIds, renderedItems],
  );

  const isFocusedItemStillVisible =
    focusedId !== null && flat.some((row) => row.item.id === focusedId);
  if (!isFocusedItemStillVisible) {
    const firstVisibleItemId = flat[0]?.item.id ?? null;
    if (focusedId !== firstVisibleItemId) setFocusedId(firstVisibleItemId);
  }

  useEffect(() => {
    if (!menuOpenId) return;
    const frame = requestAnimationFrame(() => {
      const menus = Array.from(
        document.querySelectorAll<HTMLElement>("[data-sidebar-resource-menu]"),
      );
      menus
        .find((menu) => menu.dataset.sidebarResourceMenu === menuOpenId)
        ?.querySelector<HTMLElement>("button, a[href]")
        ?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [menuOpenId]);

  const updateItems = useCallback(
    (next: SidebarResource[]) => {
      setInternalItems(next);
      onItemsChange?.(next);
    },
    [onItemsChange],
  );

  const commitExpanded = useCallback(
    (next: Set<string>) => {
      if (controlledExpandedIds === undefined) setOwnExpandedIds(next);
      onExpandedChange?.([...next]);
    },
    [controlledExpandedIds, onExpandedChange],
  );

  const getItem = useCallback(
    (id: string) => findResource(renderedItems, id),
    [renderedItems],
  );

  const isExpanded = useCallback(
    (id: string) => expandedIds.has(id),
    [expandedIds],
  );

  const expand = useCallback(
    (id: string) => {
      if (expandedIds.has(id)) return;
      commitExpanded(new Set(expandedIds).add(id));
    },
    [commitExpanded, expandedIds],
  );

  const collapse = useCallback(
    (id: string) => {
      if (!expandedIds.has(id)) return;
      const next = new Set(expandedIds);
      next.delete(id);
      commitExpanded(next);
    },
    [commitExpanded, expandedIds],
  );

  const toggleExpanded = useCallback(
    (id: string) => {
      const next = new Set(expandedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      commitExpanded(next);
    },
    [commitExpanded, expandedIds],
  );

  const expandAll = useCallback(() => {
    commitExpanded(new Set(expandableIdsOf(renderedItems)));
  }, [commitExpanded, renderedItems]);

  const collapseAll = useCallback(() => {
    commitExpanded(new Set());
  }, [commitExpanded]);

  const reveal = useCallback(
    (id: string) => {
      const ancestors = ancestorIdsOf(renderedItems, id);
      if (!ancestors.some((ancestor) => !expandedIds.has(ancestor))) return;
      commitExpanded(new Set([...expandedIds, ...ancestors]));
    },
    [commitExpanded, expandedIds, renderedItems],
  );

  const move = useCallback(
    async (move: SidebarResourceMove) => {
      if (movePendingRef.current) {
        setAnnouncement("Wait for the current move to finish.");
        return;
      }
      const before = renderedItems;
      const next = moveResource(before, move);
      if (!next || next === before) return;

      movePendingRef.current = true;
      setMovePending(true);
      updateItems(next);
      setDropTarget(null);
      setDraggingId(null);
      const moved = findResource(before, move.itemId);
      const target = move.targetId ? findResource(before, move.targetId) : null;
      setAnnouncement(
        target
          ? `Moved ${moved?.label ?? "item"} ${move.position} ${target.label}.`
          : `Moved ${moved?.label ?? "item"} to the top level.`,
      );

      try {
        await onMove?.(move);
      } catch (error) {
        updateItems(before);
        setAnnouncement(`Move failed. ${moved?.label ?? "Item"} was restored.`);
        onMoveError?.(error, move);
      } finally {
        movePendingRef.current = false;
        setMovePending(false);
      }
    },
    [onMove, onMoveError, renderedItems, updateItems],
  );

  const focus = useCallback((id: string) => {
    setFocusedId(id);
    requestAnimationFrame(() => rowRefs.current.get(id)?.focus());
  }, []);

  const select = useCallback(
    (id: string) => {
      if (activeId === undefined) setInternalActiveId(id);
      onActiveChange?.(id);
    },
    [activeId, onActiveChange],
  );

  const startRename = useCallback(
    (id: string) => {
      // An id from elsewhere would arm rename mode against a row that
      // never renders.
      if (!findResource(renderedItems, id)) return;
      setRenamingId(id);
    },
    [renderedItems],
  );

  const cancelRename = useCallback(() => setRenamingId(null), []);

  const rename = useCallback(
    (id: string, label: string) => {
      const trimmed = label.trim();
      setRenamingId(null);
      const item = findResource(renderedItems, id);
      if (!item || !trimmed || trimmed === item.label) return;
      const before = renderedItems;
      updateItems(renameResource(before, id, trimmed));
      void Promise.resolve(onRename?.(item, trimmed)).catch(() => {
        updateItems(before);
        setAnnouncement(`Rename failed. ${item.label} was restored.`);
      });
    },
    [onRename, renderedItems, updateItems],
  );

  const openMenu = useCallback(
    (id: string) => {
      if (!findResource(renderedItems, id)) return;
      setMenuOpenId(id);
    },
    [renderedItems],
  );

  // Closing returns focus to the row that owned the menu — otherwise focus
  // falls back to the body and the keyboard user loses their place.
  const closeMenu = useCallback(() => {
    setMenuOpenId((current) => {
      if (current) focus(current);
      return null;
    });
  }, [focus]);

  const onRowKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>, row: FlatResource) => {
      const index = flat.findIndex(({ item }) => item.id === row.item.id);
      const previous = flat[index - 1];
      const next = flat[index + 1];
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
      if (event.key === "Home" && flat[0]) {
        event.preventDefault();
        focus(flat[0].item.id);
        return;
      }
      if (event.key === "End" && flat.at(-1)) {
        event.preventDefault();
        focus(flat.at(-1)?.item.id ?? row.item.id);
        return;
      }

      if (row.item.disabled) {
        if (event.key === "ArrowLeft" && row.parentId) {
          event.preventDefault();
          focus(row.parentId);
        } else if (
          moveModifier ||
          ["ArrowRight", "Enter", " ", "F2", "ContextMenu"].includes(
            event.key,
          ) ||
          (event.shiftKey && event.key === "F10")
        ) {
          event.preventDefault();
        }
        return;
      }

      if (moveModifier && event.key === "ArrowUp" && previous) {
        event.preventDefault();
        void move({ itemId: row.item.id, targetId: previous.item.id, position: "before" });
        return;
      }
      if (moveModifier && event.key === "ArrowDown" && next) {
        event.preventDefault();
        void move({ itemId: row.item.id, targetId: next.item.id, position: "after" });
        return;
      }
      if (moveModifier && event.key === "ArrowRight" && previous && canContain(previous.item)) {
        event.preventDefault();
        expand(previous.item.id);
        void move({ itemId: row.item.id, targetId: previous.item.id, position: "inside" });
        return;
      }
      if (moveModifier && event.key === "ArrowLeft" && row.parentId) {
        event.preventDefault();
        void move({ itemId: row.item.id, targetId: row.parentId, position: "after" });
        return;
      }

      if (event.key === "ArrowRight" && canContain(row.item)) {
        event.preventDefault();
        if (!expandedIds.has(row.item.id)) expand(row.item.id);
        else if (next?.parentId === row.item.id) focus(next.item.id);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (expandedIds.has(row.item.id)) collapse(row.item.id);
        else if (row.parentId) focus(row.parentId);
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (canContain(row.item)) toggleExpanded(row.item.id);
        else select(row.item.id);
      } else if (event.key === "F2") {
        event.preventDefault();
        startRename(row.item.id);
      } else if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
        event.preventDefault();
        openMenu(row.item.id);
      }
    },
    [
      collapse,
      expand,
      expandedIds,
      flat,
      focus,
      move,
      openMenu,
      select,
      startRename,
      toggleExpanded,
    ],
  );

  const onRootDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (!draggingId || event.target !== event.currentTarget) return;
      event.preventDefault();
      setDropTarget({ id: null, position: "after" });
    },
    [draggingId],
  );

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (draggingId && dropTarget) {
        void move({
          itemId: draggingId,
          targetId: dropTarget.id,
          position: dropTarget.position,
        });
      }
    },
    [draggingId, dropTarget, move],
  );

  const onRowDragStart = useCallback(
    (event: DragEvent<HTMLDivElement>, id: string) => {
      setDraggingId(id);
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", id);
    },
    [],
  );

  const onRowDragEnd = useCallback(() => {
    setDraggingId(null);
    setDropTarget(null);
  }, []);

  const onRowDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>, targetRow: FlatResource) => {
      if (!draggingId || draggingId === targetRow.item.id) return;
      const source = findResource(renderedItems, draggingId);
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
    [draggingId, renderedItems],
  );

  const onRowHover = useCallback((id: string, hovered: boolean) => {
    setHoveredId((current) =>
      hovered ? id : current === id ? null : current,
    );
  }, []);

  const clearHover = useCallback(() => setHoveredId(null), []);

  const setRowRef = useCallback((id: string, node: HTMLDivElement | null) => {
    if (node) rowRefs.current.set(id, node);
    else rowRefs.current.delete(id);
  }, []);

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
    ],
  );

  const hover = useMemo(
    () => ({
      hoveredId,
      layoutId: hoverLayoutId,
      onRowHover,
      clear: clearHover,
    }),
    [clearHover, hoverLayoutId, hoveredId, onRowHover],
  );

  return useMemo<AISidebarController>(
    () => ({
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
      dnd,
      hover,
      onRowKeyDown,
      setRowRef,
    }),
    [
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
      dnd,
      hover,
      onRowKeyDown,
      setRowRef,
    ],
  );
}
