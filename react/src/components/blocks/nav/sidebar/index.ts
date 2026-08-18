import { AISidebar } from "./ai-sidebar"
import { MarqueeLabel } from "./marquee-label.tsx"
import { ResourceRow } from "./sidebar-row.tsx"
import { SidebarIcon } from "./sidebar-icon.tsx"
export { useAISidebar, type UseAISidebarOptions } from "./use-ai-sidebar.ts"
export {
  useAISidebarActions,
  useAISidebarState,
} from "./use-ai-sidebar-state.ts"
export type * from "./type.ts"
// The public atom surface. `@internal` atoms (config, handlers, mount, the
// projections, the owned-* loop guards) stay unexported on purpose —
// `export *` would make every internal a breaking-change surface for
// consumer apps.
export {
  aiSidebarActiveIdAtom,
  aiSidebarAnnouncementAtom,
  aiSidebarDraggingIdAtom,
  aiSidebarDropTargetAtom,
  aiSidebarExpandedIdsAtom,
  aiSidebarFlatAtom,
  aiSidebarFocusedIdAtom,
  aiSidebarHoverActiveAtom,
  aiSidebarHoveredIdAtom,
  aiSidebarItemsAtom,
  aiSidebarMenuOpenIdAtom,
  aiSidebarMovePendingAtom,
  aiSidebarRenamingIdAtom,
  aiSidebarRowDraggingAtom,
  aiSidebarRowDropAtom,
  aiSidebarRowExpandedAtom,
  aiSidebarRowFocusedAtom,
  aiSidebarRowHoveredAtom,
  aiSidebarRowMenuOpenAtom,
  aiSidebarRowRenamingAtom,
  aiSidebarRowSelectedAtom,
  aiSidebarStateAtom,
  cancelAISidebarRenameAtom,
  clearAISidebarHoverAtom,
  closeAISidebarMenuAtom,
  collapseAISidebarRowAtom,
  collapseAllAISidebarRowsAtom,
  endAISidebarDragAtom,
  expandAISidebarRowAtom,
  expandAllAISidebarRowsAtom,
  focusAISidebarRowAtom,
  moveAISidebarRowAtom,
  openAISidebarMenuAtom,
  removeAISidebarInstance,
  renameAISidebarRowAtom,
  resetAISidebarAtom,
  revealAISidebarRowAtom,
  selectAISidebarRowAtom,
  setAISidebarHoveredAtom,
  setAISidebarItemsAtom,
  startAISidebarRenameAtom,
  toggleAISidebarRowAtom,
} from "./ai-sidebar-atom.ts"

export { AISidebar, MarqueeLabel, ResourceRow, SidebarIcon }

export const Sidebar = {
  Wrapper: AISidebar,
  MarqueeLabel,
  Row: ResourceRow,
  Icon: SidebarIcon,
}
