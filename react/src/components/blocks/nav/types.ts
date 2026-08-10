
/** A nested link, one level under a top-level entry. */
export interface ISidebarNavSubItem {
  id: string
  label: string
  icon?: React.ReactNode
  /** Renders an anchor. Without one the row is a button. */
  href?: string
  disabled?: boolean
  target?: "_blank" | "_self" | "_parent" | "_top"
  onSelect?: () => void
}

/** A top-level entry. With `items` it expands instead of navigating. */
export interface ISidebarNavItem extends ISidebarNavSubItem {
  /** Trailing hint — a count, a "New" pill. Hidden while collapsed. */
  badge?: React.ReactNode
  items?: ISidebarNavSubItem[]
  /** Start expanded. Defaults to expanded when one of its children is active. */
  defaultOpen?: boolean
}

/** A titled run of entries. The title hides while the rail is collapsed. */
export interface ISidebarNavSection {
  id: string
  label?: string
  items: ISidebarNavItem[]
}

export interface ISidebarBlockProps {
  sections: ISidebarNavSection[]
  /** `id` of the current entry — matches top-level and nested ids alike. */
  activeId?: string
  /** Fires for every selection, after the entry's own `onSelect`. */
  onNavigate?: (item: ISidebarNavItem | ISidebarNavSubItem) => void
  /** Brand row above the navigation. */
  header?: React.ReactNode
  /** Pinned below the navigation — an account card, a version note. */
  footer?: React.ReactNode
  /** Collapse toggle in the header row. */
  showTrigger?: boolean
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  /** How the rail collapses: to icons, off-canvas, or not at all. */
  collapsible?: "offcanvas" | "icon" | "none"
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Under 768px the panel is a drawer — drive it from your own header. */
  openMobile?: boolean
  defaultOpenMobile?: boolean
  onOpenMobileChange?: (open: boolean) => void
  /** Rail widths. CSS lengths, e.g. "16rem". */
  width?: string
  iconWidth?: string
  mobileWidth?: string
  ariaLabel?: string
  className?: string
}

export interface IRowProps {
  item: ISidebarNavItem
  activeId?: string
  onNavigate?: (item: ISidebarNavItem | ISidebarNavSubItem) => void
}
