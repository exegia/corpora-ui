"use client";

import { useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";

import {
  aiSidebarStateAtom,
  cancelAISidebarRenameAtom,
  closeAISidebarMenuAtom,
  collapseAISidebarRowAtom,
  collapseAllAISidebarRowsAtom,
  expandAISidebarRowAtom,
  expandAllAISidebarRowsAtom,
  focusAISidebarRowAtom,
  moveAISidebarRowAtom,
  openAISidebarMenuAtom,
  renameAISidebarRowAtom,
  resetAISidebarAtom,
  revealAISidebarRowAtom,
  selectAISidebarRowAtom,
  setAISidebarItemsAtom,
  startAISidebarRenameAtom,
  toggleAISidebarRowAtom,
} from "./ai-sidebar-atom.ts";
import type {
  AISidebarActions,
  AISidebarInstanceId,
  AISidebarState,
} from "./type.ts";

/**
 * Read the sidebar registered under `sidebarId` from anywhere below
 * `ExegiaProvider` — no controller, no props, no provider of its own.
 *
 * ```tsx
 * const { selectedId, movePending } = useAISidebarState("app-resources")
 * ```
 *
 * This returns the whole state object, so the caller re-renders on any
 * change. A component that reads one field should subscribe to that field's
 * atom instead: `useAtomValue(aiSidebarActiveIdAtom("app-resources"))`.
 */
export function useAISidebarState(
  sidebarId: AISidebarInstanceId
): AISidebarState {
  return useAtomValue(aiSidebarStateAtom(sidebarId));
}

/**
 * Drive the sidebar registered under `sidebarId` from anywhere. Writes only —
 * the caller never re-renders when the sidebar changes, so this is what a
 * command palette, a keyboard shortcut or a route guard should reach for.
 *
 * `focus` and `closeMenu` move the store's roving target; DOM focus follows
 * only for callers that hold the controller, because the row refs live in
 * the block rather than the store.
 *
 * ```tsx
 * const resources = useAISidebarActions("app-resources")
 * <Button onClick={resources.collapseAll}>Collapse all</Button>
 * ```
 */
export function useAISidebarActions(
  sidebarId: AISidebarInstanceId
): AISidebarActions {
  const select = useSetAtom(selectAISidebarRowAtom(sidebarId));
  const expand = useSetAtom(expandAISidebarRowAtom(sidebarId));
  const collapse = useSetAtom(collapseAISidebarRowAtom(sidebarId));
  const toggleExpanded = useSetAtom(toggleAISidebarRowAtom(sidebarId));
  const expandAll = useSetAtom(expandAllAISidebarRowsAtom(sidebarId));
  const collapseAll = useSetAtom(collapseAllAISidebarRowsAtom(sidebarId));
  const reveal = useSetAtom(revealAISidebarRowAtom(sidebarId));
  const focus = useSetAtom(focusAISidebarRowAtom(sidebarId));
  const startRename = useSetAtom(startAISidebarRenameAtom(sidebarId));
  const cancelRename = useSetAtom(cancelAISidebarRenameAtom(sidebarId));
  const rename = useSetAtom(renameAISidebarRowAtom(sidebarId));
  const openMenu = useSetAtom(openAISidebarMenuAtom(sidebarId));
  const closeMenuInStore = useSetAtom(closeAISidebarMenuAtom(sidebarId));
  const move = useSetAtom(moveAISidebarRowAtom(sidebarId));
  const setItems = useSetAtom(setAISidebarItemsAtom(sidebarId));
  const reset = useSetAtom(resetAISidebarAtom(sidebarId));

  return useMemo(
    () => ({
      select,
      expand,
      collapse,
      toggleExpanded,
      expandAll,
      collapseAll,
      reveal,
      focus,
      startRename,
      cancelRename,
      rename,
      openMenu,
      // The atom returns the id it closed so the block can move DOM focus;
      // remote callers have no refs, so the return value is dropped here.
      closeMenu: () => void closeMenuInStore(),
      move,
      setItems,
      reset,
    }),
    [
      select,
      expand,
      collapse,
      toggleExpanded,
      expandAll,
      collapseAll,
      reveal,
      focus,
      startRename,
      cancelRename,
      rename,
      openMenu,
      closeMenuInStore,
      move,
      setItems,
      reset,
    ]
  );
}
