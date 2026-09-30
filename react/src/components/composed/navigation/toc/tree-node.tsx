import type { JSX, MouseEventHandler } from "react"
import {
  TreeViewBranch,
  TreeViewBranchContent,
  TreeViewBranchItem,
  TreeViewContent,
  TreeViewItem,
  TreeViewNode,
} from "@/components/ui/tree-view"
import type { TocTreeNodeProps } from "./types"

const EmptyIcon = () => null

export function TocTreeNode({
  activeLink,
  indexPath,
  node,
  onLinkClick,
}: TocTreeNodeProps): JSX.Element {
  const isActive = activeLink?.link === node.item.link
  const className = isActive ? "font-medium text-primary" : undefined
  const handleBranchClick: MouseEventHandler<HTMLDivElement> = () => {
    if (onLinkClick) {
      onLinkClick(node.item)
    } else if (typeof window !== "undefined") {
      window.location.hash = node.href.slice(1)
    }
  }
  const handleLeafClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    if (!onLinkClick) return
    event.preventDefault()
    onLinkClick(node.item)
  }

  if (!node.children?.length) {
    return (
      <TreeViewNode indexPath={indexPath} node={node}>
        <TreeViewContent asChild className={className}>
          <a
            href={node.href}
            onClick={handleLeafClick}
            aria-current={isActive ? "page" : undefined}
          >
            <TreeViewItem className="w-full" icon={EmptyIcon}>
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
          className={className}
          expandedIcon={null}
          icon={null}
          onClick={handleBranchClick}
        >
          {node.item.label}
        </TreeViewBranchItem>
        <TreeViewBranchContent>
          <div className="gap-2 flex flex-col">
            {node.children.map((child, index) => (
              <TocTreeNode
                activeLink={activeLink}
                indexPath={[...indexPath, index]}
                key={child.id}
                node={child}
                onLinkClick={onLinkClick}
              />
            ))}
          </div>
        </TreeViewBranchContent>
      </TreeViewBranch>
    </TreeViewNode>
  )
}
