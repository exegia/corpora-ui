"use client"

import { LucideChevronLeft, LucideChevronRight } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import * as React from "react"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  TREE_BRANCH_EXIT,
  TREE_BRANCH_VARIANTS,
  TREE_COLLAPSE_DURATION,
  TREE_LABEL_REVEAL_DELAY,
  TREE_MICRO_TRANSITION,
  TREE_ROW_VARIANTS,
} from "./constants"
import { useTreeContext } from "./tree-context"
import type { TreeNode } from "./type"
import { EASE_OUT } from "@/lib/ease.ts"

/** How a row behaves, resolved from variant + depth + shape. */
type RowKind =
  | "section" // navigation depth 0 with 3-level data — heading, toggles
  | "toggle" // expands/collapses on row press (nav parents, files folders)
  | "link" // navigates; may still carry a chevron that toggles separately
export interface TreeRowProps {
  node: TreeNode
  depth: number
}

function rowKindOf(
  node: TreeNode,
  depth: number,
  variant: string,
  sectioned: boolean
): RowKind {
  if (variant === "sidebar") return "link"
  const branch =
    variant === "files" ? node.children !== undefined : !!node.children?.length
  if (!branch) return "link"
  if (variant === "navigation")
    return sectioned && depth === 0 ? "section" : "toggle"
  // toc parents navigate — their chevron is a separate toggle.
  return variant === "toc" ? "link" : "toggle"
}

export function TreeRow({ node, depth }: TreeRowProps): React.ReactElement {
  const { tree: ctx, renderTrailing } = useTreeContext()
  const reduce = useReducedMotion()
  const kind = rowKindOf(node, depth, ctx.variant, ctx.sectioned)

  // The sidebar rail is single-level by contract — nested children are
  // ignored rather than rendered somewhere misleading.
  const children = ctx.variant === "sidebar" ? [] : (node.children ?? [])
  const canExpand =
    kind !== "link" || (ctx.variant === "toc" && children.length > 0)
  const open = ctx.isExpanded(node.id)
  const active = ctx.activeId === node.id
  const renaming = ctx.renamingId === node.id

  const { dnd } = ctx
  const dragging = dnd.draggedId === node.id
  const drop = dnd.dropTarget?.id === node.id ? dnd.dropTarget.position : null

  // toc rows below the route level scroll — they anchor to the heading
  // that shares their id (an explicit href always wins).
  const href =
    kind === "link" && !node.disabled
      ? (node.href ??
        (ctx.variant === "toc" && depth > 0 ? `#${node.id}` : undefined))
      : undefined

  const files = ctx.variant === "files"
  const collapsed = ctx.collapsed

  function handlePress(event: React.MouseEvent) {
    if (node.disabled) {
      event.preventDefault()
      return
    }
    if (kind === "link") {
      ctx.select(node.id)
      return
    }
    ctx.toggleExpanded(node.id)
  }

  function startRename(event: React.MouseEvent) {
    if (!ctx.canRename || node.disabled) return
    event.preventDefault()
    ctx.startRename(node.id)
  }

  const label = renaming ? (
    <input
      autoFocus
      className={cn(
        "h-5 min-w-0 flex-1 rounded-sm border border-input bg-background px-1",
        "text-[length:inherit] text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
      )}
      data-slot="tree-rename-input"
      defaultValue={node.label}
      onBlur={(event) => ctx.rename(node.id, event.currentTarget.value)}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        event.stopPropagation()
        if (event.key === "Enter") ctx.rename(node.id, event.currentTarget.value)
        if (event.key === "Escape") ctx.cancelRename()
      }}
    />
  ) : ctx.variant === "sidebar" ? (
    // The rail label folds away with the rail instead of unmounting rows.
    <AnimatePresence initial={false} mode="wait">
      <motion.span
        initial={{ width: 0, opacity: 0, x: -8 }}
        animate={{
          width: collapsed ? 0 : "auto",
          opacity: collapsed ? 0 : 1,
          x: collapsed ? -8 : 0,
          display: collapsed ? "none" : "flex",
          transition: reduce
            ? { duration: 0 }
            : {
                width: {
                  delay: TREE_LABEL_REVEAL_DELAY,
                  duration: TREE_COLLAPSE_DURATION,
                  ease: "easeInOut",
                },
                opacity: {
                  delay: TREE_LABEL_REVEAL_DELAY,
                  duration: TREE_COLLAPSE_DURATION,
                  ease: "easeInOut",
                },
                x: {
                  duration: TREE_COLLAPSE_DURATION,
                  ease: "easeInOut",
                },
              },
        }}
        exit={{
          width: 0,
          opacity: 0,
          display: "none",
          x: -8,
          transition: reduce
            ? { duration: 0 }
            : {
                display: {
                  duration: TREE_COLLAPSE_DURATION,
                  ease: "easeOut",
                },
                width: {
                  duration: TREE_COLLAPSE_DURATION * 3,
                  ease: EASE_OUT,
                },
                opacity: {
                  duration: TREE_COLLAPSE_DURATION,
                  ease: "easeOut",
                },
                x: {
                  duration: TREE_COLLAPSE_DURATION * 3,
                  ease: EASE_OUT,
                },
              },
        }}
        className={cn("min-w-0 overflow-clip whitespace-nowrap")}
        data-slot="tree-row-label"
      >
        {node.label}
      </motion.span>
    </AnimatePresence>
  ) : (
    <span
      className="min-w-0 flex-1 truncate"
      onDoubleClick={ctx.canRename ? startRename : undefined}
    >
      {node.label}
    </span>
  )

  const chevron = canExpand ? (
    <motion.span
      animate={{ rotate: open ? (ctx.variant === "navigation" ? -90 : 90) : 0 }}
      aria-hidden
      className="flex size-4 shrink-0 items-center justify-center text-muted-foreground/70"
      transition={reduce ? { duration: 0 } : TREE_MICRO_TRANSITION}
    >
      {ctx.variant === "sidebar" && (
        <LucideChevronLeft className="size-3.5 stroke-3" />
      )}
      {ctx.variant === "toc" && (
        <LucideChevronRight className="size-3.5 stroke-3" />
      )}
      {ctx.variant === "navigation" && (
        <LucideChevronLeft className="size-3.5 stroke-3" />
      )}
    </motion.span>
  ) : null

  // The trailing slot is consumer-rendered and usually holds buttons, so it
  // cannot live inside the row — a files folder row is itself a <button>, and
  // a leaf row an <a>; either one nesting a button is invalid HTML. It sits
  // beside the row instead, overlaid like the toc toggle.
  const showTrailing = files && !!renderTrailing && !renaming

  const rowClassName = cn(
    "group/row relative flex w-full min-w-0 items-center gap-2 rounded-md px-2",
    "text-left text-muted-foreground transition-colors duration-150 outline-none",
    "hover:bg-accent hover:text-accent-foreground",
    "focus-visible:ring-2 focus-visible:ring-ring",
    files ? "h-7 text-[0.8125rem]" : "h-8 text-sm",
    node.disabled && "pointer-events-none opacity-50",
    active && "bg-accent font-medium text-accent-foreground",
    dragging && "opacity-50",
    drop === "inside" && "bg-accent/60 ring-1 ring-primary/50 ring-inset",
    ctx.variant === "sidebar" && collapsed && "justify-center px-0",
    // Room for the overlay expand toggle on toc parent rows.
    ctx.variant === "toc" && kind === "link" && children.length > 0 && "pr-7",
    // …and for the overlay trailing actions on files rows. Sized for one
    // icon button plus its inset; a wider slot clips the truncated label,
    // which is why the prop is documented as row actions, not free content.
    showTrailing && "pr-9"
  )

  const rowInteractionProps = {
    "data-slot": "tree-row" as const,
    "data-id": node.id,
    "data-branch": canExpand ? "" : undefined,
    "data-expanded": canExpand && open ? "" : undefined,
    "data-active": active ? "" : undefined,
    "data-cuelume-press": ctx.sound ? "" : undefined,
    draggable: dnd.enabled && !renaming ? true : undefined,
    onDragStart: dnd.enabled
      ? (event: React.DragEvent) => dnd.onRowDragStart(event, node.id)
      : undefined,
    onDragOver: dnd.enabled
      ? (event: React.DragEvent) => dnd.onRowDragOver(event, node)
      : undefined,
    onDragLeave: dnd.enabled ? dnd.onRowDragLeave : undefined,
    onDrop: dnd.enabled
      ? (event: React.DragEvent) => dnd.onRowDrop(event, node)
      : undefined,
    onDragEnd: dnd.enabled ? dnd.onRowDragEnd : undefined,
  }

  const content = (
    <>
      {kind !== "section" && files && chevron}
      {kind !== "section" && node.icon && (
        <span
          className={cn(
            "flex size-4 shrink-0 items-center justify-center [&>svg]:size-4",
            active && "text-accent-foreground"
          )}
        >
          {node.icon}
        </span>
      )}
      {label}
      {node.badge !== undefined &&
        !(ctx.variant === "sidebar" && collapsed) && (
          <span className="ml-auto shrink-0 text-xs text-muted-foreground/80">
            {node.badge}
          </span>
        )}
      {/* nav toggle chevrons trail like the sidebar block; files lead;
          toc link rows get a separate overlay toggle instead. */}
      {kind === "toggle" && !files && (
        <span
          className={cn(
            node.badge === undefined ? "ml-auto" : "ml-1",
            "flex shrink-0"
          )}
        >
          {chevron}
        </span>
      )}
    </>
  )

  let row: React.ReactElement
  if (kind === "section") {
    row = (
      <button
        {...rowInteractionProps}
        aria-expanded={open}
        className={cn(
          "group/row flex w-full items-center gap-1 rounded-md px-2 pt-1 pb-1",
          "text-xs font-medium tracking-wide text-muted-foreground/80 uppercase",
          "transition-colors duration-150 outline-none hover:text-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring"
        )}
        onClick={handlePress}
        type="button"
      >
        <span className="truncate">{node.label}</span>
        {chevron}
      </button>
    )
  } else if (href !== undefined) {
    row = (
      <a
        {...rowInteractionProps}
        aria-current={active ? "page" : undefined}
        aria-label={
          ctx.variant === "sidebar" && collapsed ? node.label : undefined
        }
        className={rowClassName}
        href={href}
        onClick={handlePress}
        target={node.target}
      >
        {content}
      </a>
    )
  } else {
    row = (
      <button
        {...rowInteractionProps}
        aria-current={active ? "page" : undefined}
        aria-expanded={kind === "toggle" ? open : undefined}
        aria-label={
          ctx.variant === "sidebar" && collapsed ? node.label : undefined
        }
        className={rowClassName}
        disabled={node.disabled}
        onClick={handlePress}
        type="button"
      >
        {content}
      </button>
    )
  }

  // A collapsed rail row is icon-only — a tooltip names it on hover/focus.
  // Expanded, the visible label already does, so the tooltip is disabled
  // rather than unmounted: swapping the wrapper in and out with `collapsed`
  // would remount the row and cut the label's fold animation short.
  if (ctx.variant === "sidebar") {
    row = (
      <Tooltip disabled={!collapsed || node.disabled}>
        <TooltipTrigger render={row} />
        <TooltipContent side="right">{node.label}</TooltipContent>
      </Tooltip>
    )
  }

  // toc parents navigate on the row itself, so their chevron lives beside
  // the row as its own toggle.
  const tocToggle =
    ctx.variant === "toc" && kind === "link" && children.length > 0 ? (
      <button
        aria-expanded={open}
        aria-label={`${open ? "Collapse" : "Expand"} ${node.label}`}
        className={cn(
          "absolute top-1/2 right-1 flex size-5 -translate-y-1/2 items-center",
          "justify-center rounded-sm text-muted-foreground/70 outline-none",
          "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        )}
        onClick={(event) => {
          event.stopPropagation()
          ctx.toggleExpanded(node.id)
        }}
        type="button"
      >
        {chevron}
      </button>
    ) : null

  // Revealed by hovering/focusing anywhere in the row wrapper — the row and
  // the actions are siblings now, so the trigger group lives on the wrapper.
  const trailing = showTrailing ? (
    <span
      className={cn(
        "absolute top-1/2 right-1 flex -translate-y-1/2 items-center",
        "opacity-0 transition-opacity duration-150",
        "group-focus-within/row-actions:opacity-100 group-hover/row-actions:opacity-100",
        node.disabled && "pointer-events-none opacity-50"
      )}
      data-slot="tree-trailing"
    >
      {renderTrailing?.(node)}
    </span>
  ) : null

  const branchClassName =
    kind === "section"
      ? "flex flex-col gap-0.5 overflow-clip"
      : cn(
          "flex flex-col overflow-clip border-l border-border",
          files ? "mt-0.5 ml-3 gap-px pl-1.5" : "mt-1 ml-4 gap-0.5 pl-2.5"
        )

  return (
    <motion.li
      aria-expanded={canExpand ? open : undefined}
      aria-level={depth + 1}
      aria-selected={active || undefined}
      className="relative flex min-w-0 flex-col"
      data-slot="tree-item"
      role="treeitem"
      variants={reduce ? undefined : TREE_ROW_VARIANTS}
    >
      {drop === "before" && <TreeDropLine side="top" />}
      <div className={cn("relative", showTrailing && "group/row-actions")}>
        {row}
        {tocToggle}
        {trailing}
      </div>
      {canExpand && children.length > 0 && (
        <AnimatePresence initial={false}>
          {open && (
            <motion.ul
              animate={reduce ? { opacity: 1 } : "open"}
              className={branchClassName}
              exit={reduce ? { opacity: 0 } : TREE_BRANCH_EXIT}
              initial={reduce ? { opacity: 0 } : "closed"}
              key="branch"
              role="group"
              transition={reduce ? { duration: 0.12 } : undefined}
              variants={reduce ? undefined : TREE_BRANCH_VARIANTS}
            >
              {children.map((child) => (
                <TreeRow depth={depth + 1} key={child.id} node={child} />
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      )}
      {drop === "after" && <TreeDropLine side="bottom" />}
    </motion.li>
  )
}

/** Insertion indicator above or below a row while a drag hovers it. */
function TreeDropLine({ side }: { side: "top" | "bottom" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-1 z-10 h-0.5 rounded-full bg-primary",
        side === "top" ? "top-0 -translate-y-1/2" : "bottom-0 translate-y-1/2"
      )}
      data-slot="tree-drop-indicator"
    />
  )
}
