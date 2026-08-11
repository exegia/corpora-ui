
import { AISidebar } from "./ai-sidebar"
import { MarqueeLabel } from "./marquee-label.tsx"
import { ResourceRow } from "./sidebar-row.tsx"
import { SidebarIcon } from "./sidebar-icon.tsx"
export { useAISidebar, type UseAISidebarOptions } from "./use-ai-sidebar.ts"
export type * from "./type.ts"

export const Sidebar = {
  Wrapper: AISidebar,
  MarqueeLabel,
  Row: ResourceRow,
  Icon: SidebarIcon
}
