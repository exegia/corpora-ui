"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { TreeContext } from "./tree-context"
import { TreeRow } from "./tree-node"
import type {
  TreeContextValue,
  TreeController,
  TreeDataProps,
  TreeNode,
  TreeProps,
} from "./type"
import { useTree } from "./use-tree"
import { useTreeDndHandlers } from "./use-tree-dnd"

const DEFAULT_LABELS: Record<TreeController["variant"], string> = {
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
 * Two ways to drive it. Data-driven like the sidebar block: pass `items`,
 * wire `onNavigate` into your router. Or hold a `useTree` controller and
 * pass it as `tree` — same rendering, but expand, collapse, select, rename
 * and reorder are then callable from anywhere in your app.
 *
 * Branches expand with a soft height morph and row stagger; the rail's
 * labels fold away when `collapsed` flips. Arrow keys walk visible rows,
 * expand and collapse; F2 renames in `files`.
 */
export function Tree(props: TreeProps): React.ReactElement {
  // Two components rather than one: hooks may not be called conditionally,
  // and the controller form has no props to build a fallback controller
  // from. Nobody switches a tree between the two forms at runtime.
  return props.tree ? (
    <TreeView
      ariaLabel={props.ariaLabel}
      className={props.className}
      renderTrailing={props.renderTrailing}
      tree={props.tree}
    />
  ) : (
    <UncontrolledTree {...props} />
  )
}

/** The props form: builds its own controller and renders through it. */
function UncontrolledTree(props: TreeDataProps): React.ReactElement {
  const {
    variant,
    items,
    activeId,
    onNavigate,
    sound = true,
    ariaLabel,
    className,
  } = props
  const tree = useTree({
    treeId: props.treeId,
    variant,
    items,
    activeId,
    onNavigate,
    sound,
    collapsed: variant === "sidebar" ? (props.collapsed ?? false) : undefined,
    onMove: variant === "files" ? props.onMove : undefined,
    onRename: variant === "files" ? props.onRename : undefined,
  })
  return (
    <TreeView
      ariaLabel={ariaLabel}
      className={className}
      renderTrailing={variant === "files" ? props.renderTrailing : undefined}
      tree={tree}
    />
  )
}

interface TreeViewProps {
  tree: TreeController
  ariaLabel?: string
  className?: string
  renderTrailing?: (node: TreeNode) => React.ReactNode
}

/** Rendering only — every piece of state and behaviour lives on `tree`. */
function TreeView({
  tree,
  ariaLabel,
  className,
  renderTrailing,
}: TreeViewProps): React.ReactElement {
  const { variant, items, sectioned, collapsed } = tree
  const rootRef = React.useRef<HTMLUListElement>(null)

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
          tree.expand(id)
        } else if (open) {
          focusRow(rows[index + 1])
        }
        break
      case "ArrowLeft":
        if (open && id) {
          event.preventDefault()
          tree.collapse(id)
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
        if (id && tree.canRename) {
          event.preventDefault()
          tree.startRename(id)
        }
        break
    }
  }

  // Rows take the tree's id and the stable drag handlers, never the
  // controller — so this value keeps its identity and a toggle re-renders only
  // the rows whose own atoms changed.
  const dnd = useTreeDndHandlers(tree.treeId)
  const context = React.useMemo<TreeContextValue>(
    () => ({ treeId: tree.treeId, renderTrailing, dnd }),
    [tree.treeId, renderTrailing, dnd]
  )

  const label = ariaLabel ?? DEFAULT_LABELS[variant]
  let rendered = (
    <ul
      aria-label={label}
      className={cn(
        // The list always spans its container — collapsed included. The
        // rail's fold is its container's width change (an icon-collapsed
        // panel) plus the labels folding; rows keep the full width so their
        // hit areas and hover surfaces span the rail edge to edge.
        "flex h-full w-full min-w-0 flex-col",
        collapsed && "gap-y-2!",
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
  // open state and drops the hover delay across the rail. Mounted for the
  // expanded rail too: toggling the wrapper with `collapsed` would remount
  // every row and skip the label fold animation.
  if (variant === "sidebar")
    rendered = <TooltipProvider>{rendered}</TooltipProvider>

  return (
    <TreeContext.Provider value={context}>
      {variant === "files" ? (
        <div className={cn("min-w-0", className)} data-slot="tree-root">
          {rendered}
        </div>
      ) : (
        <nav
          aria-label={label}
          className={cn("flex h-full w-full min-w-0", className)}
          data-slot="tree-root"
        >
          {rendered}
        </nav>
      )}
    </TreeContext.Provider>
  )
}
