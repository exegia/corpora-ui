"use client"

import { useEffect, useMemo, useState } from "react"
import { useAtomValue } from "jotai"
import { Tree, useTreeActions } from "@/components/composed/tree"
import type { ITreeNode } from "@/components/composed/tree/type"
import { Input } from "@/components/ui/input"
import { corpusNavigationDataAtom } from "./corpus-navigation-atom"
import {
  useCorpusNavigationActions,
  useCorpusNavigationState,
} from "./use-corpus-navigation-state"
import { anchorFor, indexCorpus } from "./utils"
import type { CorpusNode } from "./types"

export interface HierarchyPickerProps {
  navigatorId: string
}
/** Tree owns expansion; its controlled active row projects the shared draft. */
export default function HierarchyPicker({ navigatorId }: HierarchyPickerProps) {
  const data = useAtomValue(corpusNavigationDataAtom(navigatorId))
  const { draft, location } = useCorpusNavigationState(navigatorId)
  const { select } = useCorpusNavigationActions(navigatorId)
  const [query, setQuery] = useState("")
  const { items, truncated } = useMemo(() => {
    if (!data) return { items: [], truncated: false }
    const hierarchy = new Set(
      data.schema.levels
        .filter((level) => level.kind === "hierarchy")
        .map((level) => level.id)
    )
    const activePath = draft
      ? (indexCorpus(data).get(draft.nodeId)?.path ?? [])
      : []
    const retained = new Set(activePath.map((node) => node.id))
    let remaining = 100
    let truncated = false
    const map = (
      nodes: readonly CorpusNode[],
      inherited = false
    ): ITreeNode[] =>
      nodes.flatMap((node) => {
        if (!hierarchy.has(node.level))
          return retained.has(node.id)
            ? map(node.children ?? [], inherited)
            : []
        const matches =
          inherited ||
          [node.label, ...(node.aliases ?? [])].some((label) =>
            label.toLocaleLowerCase().includes(query.toLocaleLowerCase())
          )
        const children = map(node.children ?? [], matches)
        if (!matches && !children.length && !retained.has(node.id)) return []
        if (remaining <= 0 && !retained.has(node.id) && !children.length) {
          truncated = true
          return []
        }
        remaining--
        return [
          {
            id: node.id,
            label: node.label,
            disabled: node.disabled,
            href: `corpus:${encodeURIComponent(node.id)}`,
            children,
            badge:
              location?.nodeId === node.id ? (
                <span className="text-primary">Reading</span>
              ) : undefined,
          },
        ]
      })
    return { items: map(data.nodes), truncated }
  }, [data, draft, location, query])
  const treeActions = useTreeActions(
    `corpus-navigation/${navigatorId}/hierarchy`
  )
  useEffect(() => {
    if (query) treeActions.expandAll()
  }, [query, items, treeActions])
  if (!data || !data.schema.levels.some((level) => level.kind === "hierarchy"))
    return null
  const selected = draft
    ? indexCorpus(data)
        .get(draft.nodeId)
        ?.path.findLast(
          (node) =>
            data.schema.levels.find((level) => level.id === node.level)
              ?.kind === "hierarchy"
        )?.id
    : undefined
  return (
    <div className="space-y-2" dir={data.direction}>
      <Input
        aria-label="Filter hierarchy"
        placeholder="Filter names…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="**:data-[slot=input]:min-h-11"
      />
      <Tree
        treeId={`corpus-navigation/${navigatorId}/hierarchy`}
        variant="toc"
        items={items}
        activeId={selected ?? ""}
        onNavigate={(node) => select(anchorFor(data, node.id))}
        ariaLabel={`${data.label} hierarchy`}
        className="max-h-80 [&&_[data-slot=tree-row]]:min-h-11 [&&_button[aria-expanded]]:min-h-11 [&&_button[aria-expanded]]:min-w-11 [&&_[data-slot=tree-row]]:pe-12 overflow-y-auto"
      />
      {!items.length && (
        <p className="text-sm text-muted-foreground">No matching names.</p>
      )}
      {truncated && (
        <p role="status" className="text-xs text-muted-foreground">
          Showing up to 100 names and your selected path. Filter to find another
          name.
        </p>
      )}
    </div>
  )
}
