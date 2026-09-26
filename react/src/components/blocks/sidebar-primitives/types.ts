import type * as React from "react";

export type SidebarValue = boolean | ((previous: boolean) => boolean);
export interface SidebarState {
  state: "expanded" | "collapsed";
  open: boolean;
  openMobile: boolean;
  isMobile: boolean;
}
export interface SidebarActions {
  setOpen: (value: SidebarValue) => void;
  setOpenMobile: (value: SidebarValue) => void;
  toggleSidebar: () => void;
}
export type SidebarContextProps = SidebarState & SidebarActions;
export type SidebarProviderProps = React.ComponentProps<"div"> & {
  /** Explicit ids retain state across remounts and support remote actions. */
  sidebarId?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};
/** @internal */
export interface SidebarConfig {
  controlled: boolean;
  onOpenChange?: (open: boolean) => void;
}
