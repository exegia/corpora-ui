"use client"

import { Grid2x2, List, TableOfContents } from "lucide-react"
import {
  isValidElement,
  useMemo,
  useState,
  type MouseEventHandler,
  type ReactNode,
} from "react"
import { Text } from "@/components/atoms/text"
import {
  PaginationGrid,
  paginationGridItemClassName,
} from "@/components/ui/pagination"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  createTreeCollection,
  TreeView,
  TreeViewBranch,
  TreeViewBranchContent,
  TreeViewBranchItem,
  TreeViewContent,
  TreeViewItem,
  TreeViewLabel,
  TreeViewNode,
  TreeViewTree,
} from "@/components/ui/tree-view"
import { cn } from "@/lib/utils"
import type {
  ITocProps,
  TNodeType,
  TocTreeNodeProps,
  TTocCollectionNode,
  TTocItem,
  TTocTreeNode,
  TViewMode,
} from "./types"
import { hasSectionWithNestedNodes, isBibleOrQuranCollection } from "./utils"

const EmptyIcon = () => null
const GRID_NODE_TYPES = new Set<TNodeType>(["chapter", "verse", "surah"])

const getLabelText = (label: ReactNode, fallback: string): string => {
  if (typeof label === "string" || typeof label === "number") {
    return String(label)
  }

  if (Array.isArray(label)) {
    const text = label
      .map((child) => getLabelText(child, ""))
      .join("")
      .trim()

    return text || fallback
  }

  if (isValidElement<{ children?: ReactNode }>(label)) {
    return getLabelText(label.props.children, fallback)
  }

  return fallback
}

const mapItemsToTreeNodes = (items: readonly TTocItem[]): TTocTreeNode[] =>
  items.map((item) => ({
    id: item.id,
    name: getLabelText(item.label, item.id),
    href: item.link,
    item,
    children: item.nodes ? mapItemsToTreeNodes(item.nodes) : undefined,
  }))

const isGridNodeType = (type: TNodeType): boolean => GRID_NODE_TYPES.has(type)

function TocTreeNode({
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
            <div className="flex flex-col gap-2">
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

function DefaultSection({ item }: { item: TTocItem }) {
  return (
    <div className="gap-1 flex flex-col">
      <Text.Label className="font-serif">{item.label}</Text.Label>
      {item.description ? (
        <p className="text-xs text-neutral-300 dark:text-neutral-600">{item.description}</p>
      ) : null}
    </div>
  )
}

export function TableOfContent<T extends TTocItem>({
  items,
  activeLink,
  onLinkClick,
  renderSection,
}: ITocProps<T>) {
  const [viewMode, setViewMode] = useState<TViewMode>("list")
  const nodes = useMemo(() => mapItemsToTreeNodes(items), [items])
  const collection = useMemo(
    () =>
      createTreeCollection<TTocCollectionNode>({
        rootNode: {
          id: "root",
          name: "Table of Contents",
          children: nodes,
        },
      }),
    [nodes]
  )
  const renderRootSections = hasSectionWithNestedNodes(items)
  const supportsGridView = isBibleOrQuranCollection(items)
  const handleLinkClick = onLinkClick
    ? (item: TTocItem) => onLinkClick(item as T)
    : undefined

  return (
    <div className="gap-3 flex w-full flex-col">
      <div className="gap-3 flex items-center justify-between">
        <div className="gap-2 flex items-center">
          <TableOfContents className="size-4 rotate-180" aria-hidden="true" />
          <h1 className="text-lg font-bold">Table of Content</h1>
        </div>

        {supportsGridView ? (
          <ToggleGroup
            aria-label="Table of content view"
            className="shrink-0"
            multiple={false}
            onValueChange={(value) => {
              const next = value[0]
              if (next === "grid" || next === "list") setViewMode(next)
            }}
            value={[viewMode]}
            variant="outline"
          >
            <ToggleGroupItem aria-label="List view" value="list">
              <List aria-hidden="true" />
              <span className="sm:inline hidden">List</span>
            </ToggleGroupItem>
            <ToggleGroupItem aria-label="Grid view" value="grid">
              <Grid2x2 aria-hidden="true" />
              <span className="sm:inline hidden">Grid</span>
            </ToggleGroupItem>
          </ToggleGroup>
        ) : null}
      </div>

      <p className="text-xs leading-5.5 text-muted-foreground">
        Browse the corpus by testament, book, chapter, and verse.
      </p>

      <TreeView className="w-full" collection={collection}>
        <TreeViewLabel className="sr-only">Table of Content</TreeViewLabel>
        <TreeViewTree>
          {renderRootSections
            ? nodes.map((node, sectionIndex) => (
                <div className="gap-2 flex flex-col" key={node.id}>
                  {renderSection ? (
                    renderSection(node.item as T)
                  ) : (
                    <DefaultSection item={node.item} />
                  )}

                  {node.children?.length ? (
                    <div className="gap-2 ps-2 flex flex-col">
                      {node.children.map((child, index) => (
                        <TocTreeNode
                          activeLink={activeLink}
                          indexPath={[sectionIndex, index]}
                          key={child.id}
                          node={child}
                          onLinkClick={handleLinkClick}
                          supportsGridView={supportsGridView}
                          viewMode={viewMode}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ))
            : nodes.map((node, index) => (
                <TocTreeNode
                  activeLink={activeLink}
                  indexPath={[index]}
                  key={node.id}
                  node={node}
                  onLinkClick={handleLinkClick}
                  supportsGridView={supportsGridView}
                  viewMode={viewMode}
                />
              ))}
        </TreeViewTree>
      </TreeView>
    </div>
  )
}
