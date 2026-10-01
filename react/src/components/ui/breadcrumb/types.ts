import type { ComponentProps } from "react"
import type { PopoverPopup } from "@/components/ui/popover"
import type { ReactNode } from "react"

/** Optional contextual content attached to one breadcrumb item. */
export interface BreadcrumbItemOverlay {
  type: "menu" | "popover" | "tooltip"
  /** Accessible name for the separate overlay trigger. */
  label: string
  /** MenuItem/MenuLinkItem children, popover content, or a short tooltip hint. */
  content: ReactNode
  /** Override the chevron (menu) or info icon (popover/tooltip). */
  icon?: ReactNode
  disabled?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  portalProps?: ComponentProps<typeof PopoverPopup>["portalProps"]
}
