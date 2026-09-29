import type { TTocItem, TTocTreeNode, TViewMode } from "../types"

export interface DefaultSectionProps {
  item: TTocItem
}

export interface TocTreeNodeProps {
  activeLink?: TTocItem
  inGrid?: boolean
  indexPath: number[]
  node: TTocTreeNode
  onLinkClick?: (link: TTocItem) => void
  supportsGridView: boolean
  viewMode: TViewMode
}

export interface TocViewModeToggleProps {
  viewMode: TViewMode
  onValueChange: (value: TViewMode) => void
}