"use client"

import { useMemo, useState } from "react"
import { useStore } from "jotai"
import { ChevronDownIcon } from "lucide-react"
import { BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb"
import type { BreadcrumbItemOverlay } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Canonical } from "@/components/composed/navigation/toc/canon"
import { Root as Toc } from "@/components/composed/navigation/toc/default"
import type {
  TCanonItem,
  TBookAbbreviation,
  TTocItem,
  TNodeLevel,
} from "@/components/composed/navigation/toc/types"
import { OSIS_BOOKS } from "@/lib/canonical"
import { corpusNavigationStateAtom } from "./corpus-navigation-atom"
import {
  useCorpusNavigationActions,
  useCorpusNavigationState,
} from "./use-corpus-navigation-state"
import { anchorFor, formatReference, indexCorpus } from "./utils"
import type { CorpusData, CorpusNode } from "./types"

function tocItems(nodes: readonly CorpusNode[], depth = 1): TTocItem[] {
  return nodes
    .filter((node) => !node.disabled)
    .map((node) => ({
      id: node.id,
      label: node.label,
      link: `#${encodeURIComponent(node.id)}-paragraph`,
      type: "paragraph",
      level: Math.min(depth, 6) as TNodeLevel,
      nodes: node.children ? tocItems(node.children, depth + 1) : undefined,
    }))
}

type CanonChoice = TCanonItem<
  number,
  TBookAbbreviation,
  "book" | "chapter" | "verse"
>

function canonItems(nodes: readonly CorpusNode[]): CanonChoice[] {
  return nodes.flatMap((node): CanonChoice[] => {
    if (node.disabled) return []
    if (node.level === "book") {
      const tokens = [node.id, node.label, ...(node.aliases ?? [])].map(
        (value) => value.toLowerCase()
      )
      const abbreviation = (
        Object.keys(OSIS_BOOKS) as TBookAbbreviation[]
      ).find(
        (key) =>
          tokens.includes(key.toLowerCase()) ||
          tokens.includes(OSIS_BOOKS[key].name.toLowerCase())
      )
      return abbreviation
        ? [
            {
              id: node.id,
              label: node.label,
              link: `#${encodeURIComponent(node.id)}-book`,
              level: 2,
              type: "book",
              abbreviation,
            },
          ]
        : []
    }
    const number = Number(node.reference ?? node.label)
    if (
      !Number.isFinite(number) ||
      (node.level !== "chapter" && node.level !== "verse")
    )
      return []
    return node.level === "chapter"
      ? [
          {
            id: node.id,
            label: node.label,
            link: `#${encodeURIComponent(node.id)}-chapter`,
            level: 3,
            type: "chapter",
            number,
          },
        ]
      : [
          {
            id: node.id,
            label: node.label,
            link: `#${encodeURIComponent(node.id)}-verse`,
            level: 4,
            type: "verse",
            number,
          },
        ]
  })
}

/** A breadcrumb keeps draft browsing inside its own popover, in the shared store. */
export default function LocationPopover({
  navigatorId,
  data,
  node,
  current,
  portalProps,
}: {
  navigatorId: string
  data: CorpusData
  node: CorpusNode
  current: boolean
  portalProps?: BreadcrumbItemOverlay["portalProps"]
}) {
  const [open, setOpen] = useState(false)
  const store = useStore()
  const state = useCorpusNavigationState(navigatorId)
  const actions = useCorpusNavigationActions(navigatorId)
  const path = indexCorpus(data).get(node.id)?.path ?? []
  const siblings = path.at(-2)?.children ?? data.nodes
  const canonical = useMemo(
    () => (data.schema.id === "bible" ? canonItems(siblings) : []),
    [data.schema.id, siblings]
  )
  const regular = useMemo(() => tocItems(data.nodes), [data.nodes])
  const levelLabel =
    data.schema.levels.find((level) => level.id === node.level)?.label ??
    node.level
  const selected = canonical.find((item) => item.id === state.draft?.nodeId)
  const section: TCanonItem = {
    id: `level-${node.level}`,
    label:
      data.schema.levels.find((level) => level.id === node.level)?.label ??
      data.label,
    type: "section",
    level: 1,
    link: "#locations-section",
    nodes: canonical,
  }
  const changeOpen = (next: boolean) => {
    setOpen(next)
    if (next) actions.select(anchorFor(data, node.id))
    else actions.cancel()
  }
  const content = (
    <div
      className="w-80 space-y-4 max-w-[calc(100dvw-5rem)]"
      dir={data.direction}
    >
      <div className="max-h-[min(55dvh,28rem)] overflow-x-hidden overflow-y-auto overscroll-contain">
        {canonical.length &&
        canonical.length ===
          siblings.filter((item) => !item.disabled).length ? (
          <Canonical
            items={[section]}
            activeLink={selected}
            onLinkClick={(item) => actions.select(anchorFor(data, item.id))}
          />
        ) : (
          <Toc
            items={regular}
            onLinkClick={(item) => actions.select(anchorFor(data, item.id))}
          />
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Selected <bdi>{formatReference(data, state.draft)}</bdi>
      </p>
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <div className="gap-2 pt-3 flex border-t">
        <Button variant="outline" onClick={() => changeOpen(false)}>
          Cancel
        </Button>
        <Button
          disabled={!state.draft || state.pending}
          onClick={async () => {
            await actions.commit()
            if (!store.get(corpusNavigationStateAtom(navigatorId)).error)
              setOpen(false)
          }}
        >
          {state.pending ? "Opening…" : "Go to location"}
        </Button>
      </div>
    </div>
  )
  return (
    <BreadcrumbItem
      overlay={{
        type: "popover",
        label: `Browse ${levelLabel} ${node.label}`,
        icon: <ChevronDownIcon />,
        content,
        open,
        onOpenChange: changeOpen,
        portalProps,
      }}
    >
      {current ? (
        <BreadcrumbPage>
          <bdi>{node.label}</bdi>
        </BreadcrumbPage>
      ) : (
        <span>
          <bdi>{node.label}</bdi>
        </span>
      )}
    </BreadcrumbItem>
  )
}
