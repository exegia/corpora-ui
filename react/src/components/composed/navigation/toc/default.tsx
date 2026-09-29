"use client"

import { TableOfContents } from "lucide-react"
import {
  isValidElement,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  createTreeCollection,
  TreeView,
  TreeViewLabel,
  TreeViewTree,
} from "@/components/ui/tree-view"
import type {
  ITocProps,
  TTocCollectionNode,
  TTocItem,
  TTocTreeNode,
  TViewMode,
} from "../types"
import { hasSectionWithNestedNodes, isBibleOrQuranCollection } from "../utils"
import { TocViewModeToggle } from "./grid"
import { DefaultSection } from "./section"
import { TocTreeNode } from "./tree-node"

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
          <TocViewModeToggle viewMode={viewMode} onValueChange={setViewMode} />
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

export default TableOfContent