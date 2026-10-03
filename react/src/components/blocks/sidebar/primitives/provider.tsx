"use client";

import * as React from "react";
import { useStore } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { cn } from "@/lib/utils";
import { SidebarInstanceContext } from "./context";
import { sidebarOwnedOpenAtom, sidebarConfigAtom, sidebarMobileValueAtom, removeSidebarInstance } from "./sidebar-atom";
import { useSidebarActions } from "./use-sidebar";
import { useSidebarMobile } from "./use-mobile";
import { SIDEBAR_KEYBOARD_SHORTCUT, SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON } from "./utils";
import type { SidebarProviderProps } from "./types";

export default function SidebarProvider({
  sidebarId: explicitId,
  defaultOpen = true,
  open,
  onOpenChange,
  className,
  style,
  children,
  ...props
}: SidebarProviderProps): React.ReactElement {
  const generatedId = React.useId();
  const sidebarId = explicitId ?? generatedId;
  const store = useStore();
  const isMobile = useSidebarMobile();
  const openAtom = sidebarOwnedOpenAtom(sidebarId);
  const configAtom = sidebarConfigAtom(sidebarId);
  const mobileAtom = sidebarMobileValueAtom(sidebarId);
  useHydrateAtoms([
    [openAtom, open ?? defaultOpen],
    [configAtom, { controlled: open !== undefined, onOpenChange }],
    [mobileAtom, isMobile],
  ]);
  const { toggleSidebar } = useSidebarActions(sidebarId);

  // Publish controlled props before browser events can reach the actions.
  React.useLayoutEffect(() => {
    store.set(configAtom, { controlled: open !== undefined, onOpenChange });
    if (open !== undefined) store.set(openAtom, open);
    store.set(mobileAtom, isMobile);
  }, [store, configAtom, openAtom, mobileAtom, open, onOpenChange, isMobile]);

  // Delay disposal until after Strict Mode's immediate effect replay.
  const activeInstances = React.useRef(new Set<string>());
  React.useEffect(() => {
    const active = activeInstances.current;
    active.add(sidebarId);
    return () => {
      active.delete(sidebarId);
      store.set(configAtom, { controlled: false });
      if (explicitId === undefined) queueMicrotask(() => {
        if (!active.has(sidebarId)) removeSidebarInstance(sidebarId);
      });
    };
  }, [sidebarId, explicitId, store, configAtom]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return (
    <SidebarInstanceContext.Provider value={sidebarId}>
      <div
        className={cn(
          "group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar",
          className,
        )}
        data-slot="sidebar-wrapper"
        style={{ "--sidebar-width": SIDEBAR_WIDTH, "--sidebar-width-icon": SIDEBAR_WIDTH_ICON, ...style } as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    </SidebarInstanceContext.Provider>
  );
}
