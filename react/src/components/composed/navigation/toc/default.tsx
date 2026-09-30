"use client"

import { useMemo, type JSX } from "react"
import {
  createTreeCollection,
  TreeView,
  TreeViewLabel,
  TreeViewTree,
} from "@/components/ui/tree-view"
import type { ITocProps, TTocCollectionNode } from "./types"
import { hasSectionWithNestedNodes, mapItemsToTreeNodes } from "./utils"
import { DefaultSection } from "./section"
import { TocTreeNode } from "./tree-node"

export function Root({
  items,
  activeLink,
  onLinkClick,
  renderSection,
}: ITocProps): JSX.Element {
  const nodes = useMemo(() => mapItemsToTreeNodes(items), [items])
  const collection = useMemo(
    () =>
      createTreeCollection<TTocCollectionNode>({
        rootNode: { id: "root", name: "Table of Contents", children: nodes },
      }),
    [nodes]
  )
  const renderRootSections = hasSectionWithNestedNodes(items)

  return (
    <div className="gap-3 flex w-full flex-col">
      <h1 className="text-lg font-bold">Table of Content</h1>
      <TreeView className="w-full" collection={collection}>
        <TreeViewLabel className="sr-only">Table of Content</TreeViewLabel>
        <TreeViewTree>
          {nodes.map((node, index) =>
            renderRootSections &&
            node.item.type === "section" &&
            node.children?.length ? (
              <div className="gap-2 flex flex-col" key={node.id}>
                {renderSection ? (
                  renderSection(node.item)
                ) : (
                  <DefaultSection item={node.item} />
                )}
                <div className="gap-2 ps-2 flex flex-col">
                  {node.children?.map((child, childIndex) => (
                    <TocTreeNode
                      activeLink={activeLink}
                      indexPath={[index, childIndex]}
                      key={child.id}
                      node={child}
                      onLinkClick={onLinkClick}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <TocTreeNode
                activeLink={activeLink}
                indexPath={[index]}
                key={node.id}
                node={node}
                onLinkClick={onLinkClick}
              />
            )
          )}
        </TreeViewTree>
      </TreeView>
    </div>
  )
}

export default Root
