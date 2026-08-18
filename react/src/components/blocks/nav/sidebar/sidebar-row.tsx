"use client"

import {
  cloneElement,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react"
import { useAtomValue, useSetAtom } from "jotai"
import type { ResourceRowProps } from "./type"
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react"
import { ChevronRight, MoreHorizontal, Pencil } from "lucide-react"
import { SPRING_LAYOUT } from "@/lib/ease.ts"
import { cn } from "@/lib/utils.ts"
import {
  aiSidebarHoverActiveAtom,
  aiSidebarRowDraggingAtom,
  aiSidebarRowDropAtom,
  aiSidebarRowExpandedAtom,
  aiSidebarRowFocusedAtom,
  aiSidebarRowHoveredAtom,
  aiSidebarRowMenuOpenAtom,
  aiSidebarRowRenamingAtom,
  aiSidebarRowSelectedAtom,
  cancelAISidebarRenameAtom,
  focusAISidebarRowAtom,
  openAISidebarMenuAtom,
  renameAISidebarRowAtom,
  selectAISidebarRowAtom,
  startAISidebarRenameAtom,
  toggleAISidebarRowAtom,
} from "./ai-sidebar-atom.ts"
import { useAISidebarContext } from "./sidebar-context.ts"
import { canContain } from "./utils"
import { SidebarIcon } from "./sidebar-icon"
import { MarqueeLabel } from "./marquee-label"
import {
  MorphPopover,
  MorphPopoverContent,
  MorphPopoverTrigger,
} from "@/components/motion/popover-morph.tsx"
import { Button } from "@/components/ui/button"

// Same choreography as SharedLayoutBg: the wrapper only fades/blurs out when
// the pointer leaves the whole tree; a row-to-row move exits instantly so the
// layoutId pill slides instead of crossfading.
const pillVariants: Variants = {
  initial: { opacity: 0, filter: "blur(6px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
  exit: (hoverActive: boolean) =>
    !hoverActive ? { opacity: 0, filter: "blur(6px)" } : {},
}

const reducedPillVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: (hoverActive: boolean) => (!hoverActive ? { opacity: 0 } : {}),
}

function ResourceRowImpl({ row }: ResourceRowProps) {
  const {
    sidebarId,
    hoverLayoutId,
    renderIcon,
    renderMenu,
    renderActionsTrigger,
    setRowRef,
    onRowKeyDown,
    onRowHover,
    closeMenu,
    dnd,
  } = useAISidebarContext()
  const reduce = useReducedMotion() ?? false

  // One subscription per field, per row. A row re-renders when its own
  // selection, expansion, focus, rename, menu, drag or hover state changes
  // and sits still while a sibling's does — reading the controller off
  // context instead re-rendered every row on every change.
  const active = useAtomValue(aiSidebarRowSelectedAtom(sidebarId, row.item.id))
  const expanded = useAtomValue(
    aiSidebarRowExpandedAtom(sidebarId, row.item.id)
  )
  const focused = useAtomValue(aiSidebarRowFocusedAtom(sidebarId, row.item.id))
  const renaming = useAtomValue(
    aiSidebarRowRenamingAtom(sidebarId, row.item.id)
  )
  const menuOpen = useAtomValue(
    aiSidebarRowMenuOpenAtom(sidebarId, row.item.id)
  )
  const isDragging = useAtomValue(
    aiSidebarRowDraggingAtom(sidebarId, row.item.id)
  )
  const dropPosition = useAtomValue(
    aiSidebarRowDropAtom(sidebarId, row.item.id)
  )
  const hoverActive = useAtomValue(aiSidebarHoverActiveAtom(sidebarId))
  const hoverPill =
    useAtomValue(aiSidebarRowHoveredAtom(sidebarId, row.item.id)) &&
    !row.item.disabled

  const select = useSetAtom(selectAISidebarRowAtom(sidebarId))
  const toggleExpanded = useSetAtom(toggleAISidebarRowAtom(sidebarId))
  const setFocusedRow = useSetAtom(focusAISidebarRowAtom(sidebarId))
  const startRename = useSetAtom(startAISidebarRenameAtom(sidebarId))
  const cancelRename = useSetAtom(cancelAISidebarRenameAtom(sidebarId))
  const rename = useSetAtom(renameAISidebarRowAtom(sidebarId))
  const openMenu = useSetAtom(openAISidebarMenuAtom(sidebarId))

  const onMenuOpenChange = useCallback(
    (open: boolean) => {
      if (open) openMenu(row.item.id)
      else closeMenu()
    },
    [closeMenu, openMenu, row.item.id]
  )

  const setRef = useCallback(
    (node: HTMLDivElement | null) => setRowRef(row.item.id, node),
    [row.item.id, setRowRef]
  )

  const [hovered, setHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const skipRenameBlurRef = useRef(false)
  const draggedRef = useRef(false)
  const [draft, setDraft] = useState(row.item.label)
  const acceptsChildren = canContain(row.item)

  useEffect(() => {
    if (!renaming) return
    skipRenameBlurRef.current = false
    // setDraft(row.item.label);
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }, [renaming, row.item.label])

  const menu = renderMenu?.(row.item, {
    close: () => onMenuOpenChange(false),
    rename: () => {
      onMenuOpenChange(false)
      startRename(row.item.id)
    },
  }) ?? (
    <button
      type="button"
      onClick={() => {
        onMenuOpenChange(false)
        startRename(row.item.id)
      }}
      className="flex h-8 w-full items-center gap-2 rounded-lg px-2.5 text-left text-xs text-foreground transition-colors outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Pencil aria-hidden="true" className="size-3.5" />
      Rename
    </button>
  )

  return (
    <motion.div
      ref={setRef}
      layout="position"
      transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
      role="treeitem"
      aria-level={row.depth + 1}
      aria-selected={acceptsChildren ? undefined : active}
      aria-expanded={acceptsChildren ? expanded : undefined}
      aria-disabled={row.item.disabled || undefined}
      tabIndex={focused ? 0 : -1}
      draggable={!row.item.disabled && !renaming}
      data-menu-open={menuOpen || undefined}
      data-drop={dropPosition ?? undefined}
      data-dragging={isDragging || undefined}
      onFocus={() => setFocusedRow(row.item.id)}
      onKeyDown={(event) => onRowKeyDown(event, row)}
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          draggedRef.current ||
          renaming ||
          row.item.disabled
        )
          return
        if (acceptsChildren) toggleExpanded(row.item.id)
        else select(row.item.id)
      }}
      onDoubleClick={(event) => {
        if (acceptsChildren || row.item.disabled) return
        event.preventDefault()
        startRename(row.item.id)
      }}
      onMouseEnter={() => {
        setHovered(true)
        onRowHover(row.item.id, true)
      }}
      onMouseLeave={() => {
        setHovered(false)
        onRowHover(row.item.id, false)
      }}
      onDragStartCapture={(event) => {
        draggedRef.current = true
        dnd.onRowDragStart(event, row.item.id)
      }}
      onDragEndCapture={() => {
        dnd.onRowDragEnd()
        requestAnimationFrame(() => {
          draggedRef.current = false
        })
      }}
      onDragOver={(event) => dnd.onRowDragOver(event, row)}
      onDrop={dnd.onDrop}
      className={cn(
        "group/resource relative flex min-h-9 min-w-0 cursor-pointer items-center gap-2.5 rounded-md pr-3 text-sm outline-none",
        "text-muted-foreground transition-[color,background-color,scale] duration-150 ease-smooth-out hover:text-foreground motion-reduce:transition-none",
        !row.item.disabled &&
          !renaming &&
          "active:scale-97 motion-reduce:active:scale-100",
        // Fallback for standalone rows that render without the shared pill.
        hoverLayoutId === undefined && "hover:bg-muted",
        "focus-visible:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        "data-[menu-open=true]:bg-muted data-[menu-open=true]:text-foreground",
        "data-[dragging=true]:opacity-40",
        "data-[drop=inside]:bg-primary/10 data-[drop=inside]:ring-1 data-[drop=inside]:ring-primary/45",
        "data-[drop=before]:before:absolute data-[drop=before]:before:-top-0.5 data-[drop=before]:before:right-2 data-[drop=before]:before:left-2 data-[drop=before]:before:h-0.5 data-[drop=before]:before:rounded-full data-[drop=before]:before:bg-primary",
        "data-[drop=after]:after:absolute data-[drop=after]:after:right-2 data-[drop=after]:after:-bottom-0.5 data-[drop=after]:after:left-2 data-[drop=after]:after:h-0.5 data-[drop=after]:after:rounded-full data-[drop=after]:after:bg-primary",
        !acceptsChildren &&
          active &&
          "bg-primary/10 text-primary dark:bg-primary/25 dark:text-primary-foreground",
        row.item.disabled && "cursor-not-allowed opacity-45"
      )}
      style={{ paddingLeft: `${12 + row.depth * 16}px` }}
    >
      {hoverLayoutId ? (
        <AnimatePresence custom={hoverActive}>
          {hoverActive ? (
            <motion.span
              aria-hidden="true"
              variants={reduce ? reducedPillVariants : pillVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              custom={hoverActive}
              className="pointer-events-none absolute inset-0"
            >
              {hoverPill ? (
                <motion.span
                  layoutId={hoverLayoutId}
                  transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
                  className="block h-full w-full rounded-md bg-foreground/8 dark:bg-muted/50"
                />
              ) : null}
            </motion.span>
          ) : null}
        </AnimatePresence>
      ) : null}
      <span
        aria-hidden="true"
        className="relative grid size-5 shrink-0 place-items-center"
      >
        {renderIcon?.(row.item) ?? SidebarIcon(row.item, expanded)}
      </span>

      {renaming ? (
        <input
          ref={inputRef}
          value={draft}
          aria-label={`Rename ${row.item.label}`}
          onChange={(event) => setDraft(event.target.value)}
          draggable={false}
          onClick={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
          onBlur={() => {
            if (!skipRenameBlurRef.current) rename(row.item.id, draft)
          }}
          onKeyDown={(event) => {
            event.stopPropagation()
            if (event.key === "Enter") {
              skipRenameBlurRef.current = true
              rename(row.item.id, draft)
            }
            if (event.key === "Escape") {
              skipRenameBlurRef.current = true
              cancelRename()
            }
          }}
          className="relative h-7 min-w-0 flex-1 text-sm text-foreground outline-none focus-visible:ring-0 focus-visible:ring-ring"
        />
      ) : (
        <MarqueeLabel active={hovered || menuOpen}>
          {row.item.label}
        </MarqueeLabel>
      )}

      {!renaming && !row.item.disabled ? (
        <MorphPopover open={menuOpen} onOpenChange={onMenuOpenChange}>
          <MorphPopoverTrigger>
            {(() => {
              const custom = renderActionsTrigger?.(row.item)
              if (custom) {
                // A row click selects/toggles — the trigger must not bubble.
                const customOnClick = (
                  custom.props as {
                    onClick?: (event: MouseEvent<HTMLElement>) => void
                  }
                ).onClick
                return cloneElement(custom, {
                  draggable: false,
                  onClick: (event: MouseEvent<HTMLElement>) => {
                    event.stopPropagation()
                    customOnClick?.(event)
                  },
                } as Partial<unknown>)
              }
              return (
                <Button
                  draggable={false}
                  tabIndex={-1}
                  variant="link"
                  aria-label={`Actions for ${row.item.label}`}
                  onClick={(event) => event.stopPropagation()}
                  className="relative grid size-7 shrink-0 place-items-center rounded-lg opacity-0 transition-opacity duration-150 ease-smooth-out outline-none group-hover/resource:opacity-80 group-hover/resource:delay-150 group-data-[menu-open=true]/resource:opacity-100 hover:bg-foreground/5 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                >
                  <MoreHorizontal aria-hidden="true" className="size-4" />
                </Button>
              )
            })()}
          </MorphPopoverTrigger>
          <MorphPopoverContent
            side="bottom"
            align="end"
            sideOffset={8}
            radius={12}
            className="w-40 p-1.5"
          >
            <div data-sidebar-resource-menu={row.item.id}>{menu}</div>
          </MorphPopoverContent>
        </MorphPopover>
      ) : null}

      {row.depth === 0 &&
      acceptsChildren &&
      (row.item.children?.length ?? 0) > 0 ? (
        <ChevronRight
          aria-hidden="true"
          className={cn(
            "relative size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ease-smooth-out motion-reduce:transition-none",
            expanded && "rotate-90"
          )}
        />
      ) : null}
    </motion.div>
  )
}

/** `flat` is rebuilt whenever expansion changes, so its `FlatResource`
 * wrappers are fresh objects even for rows nothing happened to. The
 * comparator looks through the wrapper at what a row actually renders from —
 * its item (stable unless the data changed), depth and parent — so a sibling
 * opening does not walk every row. Each row's own state reaches it through
 * its atoms instead. */
function sameRow(prev: ResourceRowProps, next: ResourceRowProps): boolean {
  return (
    prev.row.item === next.row.item &&
    prev.row.depth === next.row.depth &&
    prev.row.parentId === next.row.parentId
  )
}

export const ResourceRow = memo(ResourceRowImpl, sameRow)
ResourceRow.displayName = "ResourceRow"
