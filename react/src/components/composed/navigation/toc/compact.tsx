"use client"

import { useMemo } from "react"
import {
  PreviewRail,
  type PreviewRailProps,
} from "@/components/motion/preview-rail"
import { cn } from "@/lib/utils"
import type { TTocItem } from "./type"
import { getLabelText } from "./utils"

export interface CompactTocProps extends Pick<
  PreviewRailProps,
  | "orientation"
  | "previewSide"
  | "showPreview"
  | "itemSize"
  | "className"
  | "label"
> {
  /** Regular or canonical items, traversed in document order. */
  items: readonly TTocItem[]
  activeLink?: TTocItem
  /** When supplied, the host handles navigation instead of following the hash. */
  onLinkClick?: (item: TTocItem) => void
}

/** A small document outline with a destination preview on hover or focus. */
export function Compact({
  items,
  activeLink,
  onLinkClick,
  className,
  ...props
}: CompactTocProps) {
  const entries = useMemo(() => {
    const result: { item: TTocItem; path: string[] }[] = []
    function visit(nodes: readonly TTocItem[], ancestors: string[]) {
      for (const item of nodes) {
        const path = [...ancestors, getLabelText(item.label, item.id)]
        result.push({ item, path })
        if (item.nodes) visit(item.nodes, path)
      }
    }
    visit(items, [])
    return result
  }, [items])
  const byId = useMemo(
    () => new Map(entries.map((entry) => [entry.item.id, entry])),
    [entries]
  )
  const railItems = useMemo(
    () =>
      entries.map(({ item, path }) => ({
        id: item.id,
        label: getLabelText(item.label, item.id),
        ariaLabel: path.join(" › "),
        href: onLinkClick ? undefined : item.link,
        depth: path.length - 1,
      })),
    [entries, onLinkClick]
  )

  return (
    <PreviewRail
      label="Table of contents"
      highlightActive
      {...props}
      items={railItems}
      activeId={activeLink?.id}
      className={cn(
        "min-h-0",
        props.orientation === "horizontal" ? "w-full" : "w-12",
        className
      )}
      previewContainerClassName={
        props.orientation === "horizontal"
          ? undefined
          : props.previewSide === "before"
            ? "left-auto right-16 w-64"
            : "left-16 right-auto w-64"
      }
      onItemSelect={(entry) => {
        const original = byId.get(entry.id)
        if (original) onLinkClick?.(original.item)
      }}
      renderPreview={(entry) => {
        const original = byId.get(entry.id)
        if (!original) return null
        return (
          <div className="p-3 shadow-md rounded-xl border bg-popover text-popover-foreground">
            {original.path.length > 1 && (
              <p className="mb-1 text-xs text-muted-foreground">
                {original.path.slice(0, -1).join(" › ")}
              </p>
            )}
            <p className="text-sm font-medium">{original.item.label}</p>
            {original.item.description && (
              <div className="mt-1 text-xs text-muted-foreground">
                {original.item.description}
              </div>
            )}
          </div>
        )
      }}
    />
  )
}
