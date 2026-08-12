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
  AISidebarProps,
  DropTarget,
  FlatResource,
  SidebarResource,
  SidebarResourceMove,
} from "./type.ts"
import {
  canContain,
  containsResource,
  findResource,
  flattenResources,
  moveResource,
  renameResource,
} from "./utils.ts"

export type UseAISidebarOptions = Pick<
  AISidebarProps,
  | "items"
  | "defaultItems"
  | "onItemsChange"
  | "onMove"
  | "onMoveError"
  | "onRename"
  | "activeId"
  | "defaultActiveId"
  | "onActiveChange"
  | "defaultExpandedIds"
>

export function useAISidebar({
  items,
  defaultItems = [],
  onItemsChange,
  onMove,
  onMoveError,
  onRename,
  activeId,
  defaultActiveId = null,
  onActiveChange,
  defaultExpandedIds = [],
}: UseAISidebarOptions) {
  const [internalItems, setInternalItems] = useState(items ?? defaultItems);
  const [internalActiveId, setInternalActiveId] = useState(defaultActiveId);
  const [expandedIds, setExpandedIds] = useState(
    () => new Set(defaultExpandedIds),
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
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const movePendingRef = useRef(false);
  const renderedItems = internalItems;
  const selectedId = activeId ?? internalActiveId;

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

  const performMove = useCallback(
    async (move: SidebarResourceMove) => {
      if (movePendingRef.current) {
        setAnnouncement("Wait for the current move to finish.");
        return;
      }
      const before = renderedItems;
      const next = moveResource(before, move);
      if (!next || next === before) return;

      movePendingRef.current = true;
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
      }
    },
    [onMove, onMoveError, renderedItems, updateItems],
  );

  const focusRow = useCallback((id: string) => {
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

  const toggle = useCallback((id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>, row: FlatResource) => {
      const index = flat.findIndex(({ item }) => item.id === row.item.id);
      const previous = flat[index - 1];
      const next = flat[index + 1];
      const moveModifier = event.altKey && event.shiftKey;

      if (event.key === "ArrowDown" && !moveModifier && next) {
        event.preventDefault();
        focusRow(next.item.id);
        return;
      }
      if (event.key === "ArrowUp" && !moveModifier && previous) {
        event.preventDefault();
        focusRow(previous.item.id);
        return;
      }
      if (event.key === "Home" && flat[0]) {
        event.preventDefault();
        focusRow(flat[0].item.id);
        return;
      }
      if (event.key === "End" && flat.at(-1)) {
        event.preventDefault();
        focusRow(flat.at(-1)?.item.id ?? row.item.id);
        return;
      }

      if (row.item.disabled) {
        if (event.key === "ArrowLeft" && row.parentId) {
          event.preventDefault();
          focusRow(row.parentId);
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
        void performMove({ itemId: row.item.id, targetId: previous.item.id, position: "before" });
        return;
      }
      if (moveModifier && event.key === "ArrowDown" && next) {
        event.preventDefault();
        void performMove({ itemId: row.item.id, targetId: next.item.id, position: "after" });
        return;
      }
      if (moveModifier && event.key === "ArrowRight" && previous && canContain(previous.item)) {
        event.preventDefault();
        setExpandedIds((current) => new Set(current).add(previous.item.id));
        void performMove({ itemId: row.item.id, targetId: previous.item.id, position: "inside" });
        return;
      }
      if (moveModifier && event.key === "ArrowLeft" && row.parentId) {
        event.preventDefault();
        void performMove({ itemId: row.item.id, targetId: row.parentId, position: "after" });
        return;
      }

      if (event.key === "ArrowRight" && canContain(row.item)) {
        event.preventDefault();
        if (!expandedIds.has(row.item.id)) toggle(row.item.id);
        else if (next?.parentId === row.item.id) focusRow(next.item.id);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (expandedIds.has(row.item.id)) toggle(row.item.id);
        else if (row.parentId) focusRow(row.parentId);
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (canContain(row.item)) toggle(row.item.id);
        else select(row.item.id);
      } else if (event.key === "F2") {
        event.preventDefault();
        setRenamingId(row.item.id);
      } else if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
        event.preventDefault();
        setMenuOpenId(row.item.id);
      }
    },
    [expandedIds, flat, focusRow, performMove, select, toggle],
  );

  const handleRootDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (!draggingId || event.target !== event.currentTarget) return;
      event.preventDefault();
      setDropTarget({ id: null, position: "after" });
    },
    [draggingId],
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (draggingId && dropTarget) {
        void performMove({
          itemId: draggingId,
          targetId: dropTarget.id,
          position: dropTarget.position,
        });
      }
    },
    [draggingId, dropTarget, performMove],
  );

  const handleRowDragStart = useCallback(
    (event: DragEvent<HTMLDivElement>, id: string) => {
      setDraggingId(id);
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", id);
    },
    [],
  );

  const handleRowDragEnd = useCallback(() => {
    setDraggingId(null);
    setDropTarget(null);
  }, []);

  const handleRowDragOver = useCallback(
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

  const commitRename = useCallback(
    (row: FlatResource, label: string) => {
      const trimmed = label.trim();
      setRenamingId(null);
      if (!trimmed || trimmed === row.item.label) return;
      const before = renderedItems;
      updateItems(renameResource(before, row.item.id, trimmed));
      void Promise.resolve(onRename?.(row.item, trimmed)).catch(() => {
        updateItems(before);
        setAnnouncement(`Rename failed. ${row.item.label} was restored.`);
      });
    },
    [onRename, renderedItems, updateItems],
  );

  const handleMenuOpenChange = useCallback(
    (row: FlatResource, open: boolean) => {
      setMenuOpenId(open ? row.item.id : null);
      if (!open) focusRow(row.item.id);
    },
    [focusRow],
  );

  const handleRowHover = useCallback((id: string, hovered: boolean) => {
    setHoveredId((current) =>
      hovered ? id : current === id ? null : current,
    );
  }, []);

  const clearHover = useCallback(() => setHoveredId(null), []);

  const setRowRef = useCallback((id: string, node: HTMLDivElement | null) => {
    if (node) rowRefs.current.set(id, node);
    else rowRefs.current.delete(id);
  }, []);

  return {
    flat,
    selectedId,
    expandedIds,
    focusedId,
    setFocusedId,
    draggingId,
    dropTarget,
    hoveredId,
    hoverLayoutId,
    handleRowHover,
    clearHover,
    menuOpenId,
    renamingId,
    setRenamingId,
    announcement,
    select,
    toggle,
    handleKeyDown,
    handleRootDragOver,
    handleDrop,
    handleRowDragStart,
    handleRowDragEnd,
    handleRowDragOver,
    commitRename,
    handleMenuOpenChange,
    setRowRef,
  };
}
