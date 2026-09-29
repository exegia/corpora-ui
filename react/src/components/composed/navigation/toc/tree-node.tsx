import type { MouseEventHandler } from "react"
import {
  TreeViewBranch,
  TreeViewBranchContent,
  TreeViewBranchItem,
  TreeViewContent,
  TreeViewItem,
  TreeViewNode,
} from "@/components/ui/tree-view"
import {
  PaginationGrid,
  paginationGridItemClassName,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"
import { isGridNodeType } from "./grid"
import type { TocTreeNodeProps } from "./types"

const EmptyIcon = () => null

export function TocTreeNode({
  activeLink,
  inGrid = false,
  indexPath,
  node,
  onLinkClick,
  supportsGridView,
  viewMode,
}: TocTreeNodeProps) {
  const isActive = activeLink?.link === node.item.link
  const className = isActive ? "font-medium text-primary" : undefined
  const renderChildrenAsGrid =
    supportsGridView &&
    viewMode === "grid" &&
    (node.children?.length ?? 0) > 0 &&
    node.children?.every((child) => isGridNodeType(child.item.type))
  const childType = node.children?.[0]?.item.type
  const selectItem = () => onLinkClick?.(node.item)
  const handleBranchClick: MouseEventHandler<HTMLDivElement> = (event) => {
    if (onLinkClick) {
      event.preventDefault()
      selectItem()
      return
    }

    if (typeof window !== "undefined" && node.href.startsWith("#")) {
      window.location.hash = node.href.slice(1)
    }
  }
  const handleLeafClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    if (!onLinkClick) return

    event.preventDefault()
    selectItem()
  }

  if (!node.children?.length) {
    return (
      <TreeViewNode indexPath={indexPath} node={node}>
        <TreeViewContent
          asChild
          className={cn(
            inGrid && paginationGridItemClassName({ active: isActive }),
            !inGrid && className
          )}
        >
          <a href={node.href} onClick={handleLeafClick}>
            <TreeViewItem
              className={cn(
                "w-full",
                inGrid &&
                  "[&_[data-slot=tree-view-item-title]]:justify-center [&_[data-slot=tree-view-item-title]]:text-center"
              )}
              icon={EmptyIcon}
            >
              {node.item.label}
            </TreeViewItem>
          </a>
        </TreeViewContent>
      </TreeViewNode>
    )
  }

  return (
    <TreeViewNode indexPath={indexPath} node={node}>
      <TreeViewBranch className="gap-2 flex flex-col">
        <TreeViewBranchItem
          className={cn(
            className,
            inGrid &&
              paginationGridItemClassName({
                active: isActive,
                compact: childType === "verse",
                role: "branch",
              }),
            inGrid && "text-center"
          )}
          expandedIcon={null}
          icon={null}
          onClick={handleBranchClick}
        >
          {node.item.label}
        </TreeViewBranchItem>
        <TreeViewBranchContent>
          {renderChildrenAsGrid ? (
            <PaginationGrid variant={childType === "verse" ? "verse" : "default"}>
              {node.children.map((child, index) => (
                <TocTreeNode
                  activeLink={activeLink}
                  inGrid={true}
                  indexPath={[...indexPath, index]}
                  key={child.id}
                  node={child}
                  onLinkClick={onLinkClick}
                  supportsGridView={supportsGridView}
                  viewMode={viewMode}
                />
              ))}
            </PaginationGrid>
          ) : (
            <div className="gap-2 flex flex-col">
              {node.children.map((child, index) => (
                <TocTreeNode
                  activeLink={activeLink}
                  indexPath={[...indexPath, index]}
                  key={child.id}
                  node={child}
                  onLinkClick={onLinkClick}
                  supportsGridView={supportsGridView}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </TreeViewBranchContent>
      </TreeViewBranch>
    </TreeViewNode>
  )
}
