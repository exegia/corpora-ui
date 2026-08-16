"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { playCue } from "@/lib/sound"
import { TooltipProvider } from "@/components/ui/tooltip"
import { TreeContext } from "./tree-context"
import { TreeRow } from "./tree-node"
import type { TreeContextValue, TreeProps } from "./type"
import { useTreeDnd } from "./use-tree-dnd"
import { ancestorIdsOf, hasThreeLevels, initialExpandedIds } from "./utils"

const DEFAULT_LABELS: Record<TreeProps["variant"], string> = {
  navigation: "Main",
  toc: "On this page",
  sidebar: "Main",
  files: "Files",
}

/**
 * A nested item tree with four shapes: `navigation` (app nav — 3-level
 * data promotes the top level to collapsible section names), `toc`
 * (routes on top, in-page `#` anchors at the leaves), `sidebar` (a
 * single-level rail that collapses to icons) and `files` (a compact file
 * explorer with rename, drag-and-drop and trailing row actions).
 *
 * Data-driven like the sidebar block: pass `items`, wire `onNavigate`
 * into your router. Branches expand with a soft height morph and row
 * stagger; the rail's labels fold away when `collapsed` flips. Arrow
 * keys walk visible rows, expand and collapse; F2 renames in `files`.
 */
export function Tree(props: TreeProps): React.ReactElement {
  const {
    variant,
    items,
    activeId,
    onNavigate,
    sound = true,
    ariaLabel,
    className,
  } = props
  const collapsed = variant === "sidebar" ? (props.collapsed ?? false) : false
  const onMove = variant === "files" ? props.onMove : undefined
  const onRename = variant === "files" ? props.onRename : undefined
  const renderTrailing = variant === "files" ? props.renderTrailing : undefined

  const sectioned = variant === "navigation" && hasThreeLevels(items)
  const rootRef = React.useRef<HTMLUListElement>(null)

  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(() => {
    const expanded = initialExpandedIds(items, activeId)
    // Section names default open — they are headings over their run of
    // items, not drawers; `defaultOpen: false` still starts one closed.
    if (sectioned)
      for (const node of items)
        if (node.defaultOpen !== false) expanded.add(node.id)
    return expanded
  })
  const [renamingId, setRenamingId] = React.useState<string | null>(null)

  // Navigating into a nested entry from elsewhere reveals its ancestors,
  // even ones the reader had collapsed. Adjusted during render so the
  // branch never paints closed for a frame first.
  const [prevActiveId, setPrevActiveId] = React.useState(activeId)
  if (activeId !== prevActiveId) {
    setPrevActiveId(activeId)
    if (activeId !== undefined) {
      const ancestors = ancestorIdsOf(items, activeId)
      if (ancestors.some((id) => !expandedIds.has(id)))
        setExpandedIds(new Set([...expandedIds, ...ancestors]))
    }
  }

  const isExpanded = React.useCallback(
    (id: string) => expandedIds.has(id),
    [expandedIds]
  )
  const toggleExpanded = React.useCallback(
    (id: string) => {
      setExpandedIds((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
      if (sound) playCue("toggle")
    },
    [sound]
  )

  const dnd = useTreeDnd(items, onMove)

  // Roving over the DOM rather than a parallel model: collapsed branches
  // unmount, so a row query is exactly the visible set in order.
  function handleKeyDown(event: React.KeyboardEvent) {
    const row = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-slot="tree-row"]'
    )
    const root = rootRef.current
    if (!row || !root) return
    const rows = Array.from(
      root.querySelectorAll<HTMLElement>('[data-slot="tree-row"]')
    )
    const index = rows.indexOf(row)
    if (index < 0) return
    const id = row.getAttribute("data-id")
    const branch = row.hasAttribute("data-branch")
    const open = row.hasAttribute("data-expanded")

    const focusRow = (target: HTMLElement | undefined) => {
      if (!target) return
      event.preventDefault()
      target.focus()
    }

    switch (event.key) {
      case "ArrowDown":
        focusRow(rows[index + 1])
        break
      case "ArrowUp":
        focusRow(rows[index - 1])
        break
      case "Home":
        focusRow(rows[0])
        break
      case "End":
        focusRow(rows[rows.length - 1])
        break
      case "ArrowRight":
        if (branch && !open && id) {
          event.preventDefault()
          toggleExpanded(id)
        } else if (open) {
          focusRow(rows[index + 1])
        }
        break
      case "ArrowLeft":
        if (open && id) {
          event.preventDefault()
          toggleExpanded(id)
        } else {
          focusRow(
            row
              .closest("li")
              ?.parentElement?.closest("li")
              ?.querySelector<HTMLElement>('[data-slot="tree-row"]') ??
              undefined
          )
        }
        break
      case "F2":
        if (variant === "files" && onRename && id) {
          event.preventDefault()
          setRenamingId(id)
        }
        break
    }
  }

  const context = React.useMemo<TreeContextValue>(
    () => ({
      variant,
      sectioned,
      activeId,
      collapsed,
      sound,
      onNavigate,
      onRename,
      renderTrailing,
      isExpanded,
      toggleExpanded,
      renamingId,
      setRenamingId,
      dnd,
    }),
    [
      variant,
      sectioned,
      activeId,
      collapsed,
      sound,
      onNavigate,
      onRename,
      renderTrailing,
      isExpanded,
      toggleExpanded,
      renamingId,
      dnd,
    ]
  )

  const label = ariaLabel ?? DEFAULT_LABELS[variant]
  let tree = (
    <ul
      aria-label={label}
      className={cn(
        "flex min-w-0 flex-col",
        variant === "files" ? "gap-px" : sectioned ? "gap-3" : "gap-0.5"
      )}
      data-collapsed={collapsed ? "" : undefined}
      data-slot="tree"
      data-variant={variant}
      onKeyDown={handleKeyDown}
      ref={rootRef}
      role="tree"
    >
      {items.map((node) => (
        <TreeRow depth={0} key={node.id} node={node} />
      ))}
    </ul>
  )

  // The collapsed rail's rows carry tooltips — one provider groups their
  // open state and drops the hover delay across the rail.
  if (variant === "sidebar" && collapsed)
    tree = <TooltipProvider>{tree}</TooltipProvider>

  return (
    <TreeContext.Provider value={context}>
      {variant === "files" ? (
        <div className={cn("min-w-0", className)} data-slot="tree-root">
          {tree}
        </div>
      ) : (
        <nav
          aria-label={label}
          className={cn("min-w-0", className)}
          data-slot="tree-root"
        >
          {tree}
        </nav>
      )}
    </TreeContext.Provider>
  )
}
