import {
  cloneElement,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react"
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
import { canContain } from "./utils"
import { SidebarIcon } from "./sidebar-icon"
import { MarqueeLabel } from "./marquee-label"
import {
  MorphPopover,
  MorphPopoverContent,
  MorphPopoverTrigger,
} from "@/components/motion/popover-morph.tsx"
import { Button } from "@/components/ui/button";

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

export function ResourceRow({
  row,
  active,
  expanded,
  focused,
  draggingId,
  dropTarget,
  menuOpen,
  renaming,
  onDragEnd,
  onDragOver,
  onDragStart,
  onDrop,
  onFocus,
  onKeyDown,
  onMenuOpenChange,
  onRenameCancel,
  onRenameCommit,
  onRenameStart,
  onSelect,
  onToggle,
  hoverActive = false,
  hoverPill = false,
  hoverLayoutId,
  onHoverChange,
  renderIcon,
  renderMenu,
  renderActionsTrigger,
  setRef,
}: ResourceRowProps) {
  const reduce = useReducedMotion() ?? false
  const [hovered, setHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const skipRenameBlurRef = useRef(false)
  const draggedRef = useRef(false)
  const [draft, setDraft] = useState(row.item.label)
  const acceptsChildren = canContain(row.item)
  const isDragging = draggingId === row.item.id
  const dropPosition =
    dropTarget?.id === row.item.id ? dropTarget.position : null

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
      onRenameStart()
    },
  }) ?? (
    <button
      type="button"
      onClick={() => {
        onMenuOpenChange(false)
        onRenameStart()
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
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          draggedRef.current ||
          renaming ||
          row.item.disabled
        )
          return
        if (acceptsChildren) onToggle()
        else onSelect()
      }}
      onDoubleClick={(event) => {
        if (acceptsChildren || row.item.disabled) return
        event.preventDefault()
        onRenameStart()
      }}
      onMouseEnter={() => {
        setHovered(true)
        onHoverChange?.(true)
      }}
      onMouseLeave={() => {
        setHovered(false)
        onHoverChange?.(false)
      }}
      onDragStartCapture={(event) => {
        draggedRef.current = true
        onDragStart(event, row.item.id)
      }}
      onDragEndCapture={() => {
        onDragEnd()
        requestAnimationFrame(() => {
          draggedRef.current = false
        })
      }}
      onDragOver={(event) => onDragOver(event, row)}
      onDrop={onDrop}
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
            if (!skipRenameBlurRef.current) onRenameCommit(draft)
          }}
          onKeyDown={(event) => {
            event.stopPropagation()
            if (event.key === "Enter") {
              skipRenameBlurRef.current = true
              onRenameCommit(draft)
            }
            if (event.key === "Escape") {
              skipRenameBlurRef.current = true
              onRenameCancel()
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
