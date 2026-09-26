"use client";

import { useContext, useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { SidebarInstanceContext } from "./context";
import { sidebarStateAtom, setSidebarOpenAtom, setSidebarOpenMobileAtom, toggleSidebarAtom } from "./sidebar-atom";
import type { SidebarActions, SidebarContextProps, SidebarState } from "./types";

export function useSidebarState(sidebarId: string): SidebarState {
  return useAtomValue(sidebarStateAtom(sidebarId));
}
export function useSidebarActions(sidebarId: string): SidebarActions {
  const setOpen = useSetAtom(setSidebarOpenAtom(sidebarId));
  const setOpenMobile = useSetAtom(setSidebarOpenMobileAtom(sidebarId));
  const toggleSidebar = useSetAtom(toggleSidebarAtom(sidebarId));
  return useMemo(() => ({ setOpen, setOpenMobile, toggleSidebar }), [setOpen, setOpenMobile, toggleSidebar]);
}
export function useSidebar(): SidebarContextProps {
  const sidebarId = useContext(SidebarInstanceContext);
  if (sidebarId === null) throw new Error("useSidebar must be used within a SidebarProvider.");
  return { ...useSidebarState(sidebarId), ...useSidebarActions(sidebarId) };
}
