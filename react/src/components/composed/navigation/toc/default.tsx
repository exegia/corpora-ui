"use client"

import { useMemo, useState, type JSX } from "react"
import {
  createTreeCollection,
  TreeView,
  TreeViewLabel,
  TreeViewTree,
} from "@/components/ui/tree-view"
import type { ITocProps, TTocCollectionNode } from "./types"
import { Kbd } from "@/components/ui/kbd"
import { SearchIcon } from "lucide-react"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group"
import {
  filterTocNodes,
  tocBranchIds,
  hasSectionWithNestedNodes,
  mapItemsToTreeNodes,
} from "./utils"
import { DefaultSection } from "./section"
import { TocTreeNode } from "./tree-node"

export function Root({
  items,
  activeLink,
  onLinkClick,
  renderSection,
}: ITocProps): JSX.Element {
  const [query, setQuery] = useState("")
  const [expandedIds, setExpandedIds] = useState<string[]>([])
  const allNodes = useMemo(() => mapItemsToTreeNodes(items), [items])
  const nodes = useMemo(
    () => filterTocNodes(allNodes, query),
    [allNodes, query]
  )
  const searching = query.trim().length > 0
  const searchExpandedIds = useMemo(() => tocBranchIds(nodes), [nodes])
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
      <InputGroup>
        <InputGroupInput
          type="search"
          aria-label="Search table of contents"
          placeholder="Search…"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
        />
        <InputGroupAddon>
          <SearchIcon aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <Kbd>⌘K</Kbd>
        </InputGroupAddon>
      </InputGroup>
      {searching && nodes.length === 0 ? (
        <p role="status" className="text-sm text-muted-foreground">
          No results found.
        </p>
      ) : null}
      <TreeView
        className="w-full"
        collection={collection}
        expandedValue={searching ? searchExpandedIds : expandedIds}
        onExpandedChange={({ expandedValue }) => {
          if (!searching) setExpandedIds(expandedValue)
        }}
      >
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
