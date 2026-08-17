"use client";

import { AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import type {
  AISidebarComponentProps,
  AISidebarController,
  AISidebarProps,
  AISidebarViewProps,
  FlatResource,
} from "./type"
import { useAISidebar } from "./use-ai-sidebar"
import { ResourceRow } from "./sidebar-row"

/**
 * Resource tree for the app rail: nested rows with drag-and-drop reorder,
 * inline rename, per-row action menus and full keyboard navigation.
 *
 * Two ways to drive it. Pass the data and handlers as props and the block
 * owns its state, or hold a `useAISidebar` controller and pass it as
 * `controller` — the same rendering, but select, expand, rename, reorder
 * and menu state are then callable from anywhere in your app.
 */
export function AISidebar(props: AISidebarComponentProps) {
  // Two components rather than one: hooks may not be called conditionally,
  // and the controller form has no options to build a fallback controller
  // from. Nobody switches a sidebar between the two forms at runtime.
  return props.controller ? (
    <AISidebarView {...viewProps(props)} controller={props.controller} />
  ) : (
    <UncontrolledAISidebar {...props} />
  )
}

/** The props form: builds its own controller and renders through it. */
function UncontrolledAISidebar(props: AISidebarProps) {
  const {
    renderIcon: _icon,
    renderMenu: _menu,
    renderActionsTrigger: _trigger,
    ariaLabel: _label,
    className: _className,
    controller: _controller,
    ...options
  } = props
  const controller = useAISidebar(options)
  return <AISidebarView {...viewProps(props)} controller={controller} />
}

function viewProps(props: AISidebarComponentProps): AISidebarViewProps {
  return {
    renderIcon: props.renderIcon,
    renderMenu: props.renderMenu,
    renderActionsTrigger: props.renderActionsTrigger,
    ariaLabel: props.ariaLabel,
    className: props.className,
  }
}

/** Rendering only — every piece of state lives on the controller. */
function AISidebarView({
  controller,
  renderIcon,
  renderMenu,
  renderActionsTrigger,
  ariaLabel = "Resources",
  className,
}: AISidebarViewProps & { controller: AISidebarController }) {
  const { dnd, hover } = controller
  const { draggingId, dropTarget } = dnd

  return (
    <>
      <div
        role="tree"
        aria-label={ariaLabel}
        aria-multiselectable="false"
        onDragOver={dnd.onRootDragOver}
        onDrop={dnd.onDrop}
        onMouseLeave={hover.clear}
        className={cn(
          "relative min-w-0 flex-col gap-0.5 [overflow-anchor:none] group-data-[state=collapsed]/sidebar:hidden",
          draggingId && "pb-9 select-none",
          className
        )}
      >
        <AnimatePresence initial={false}>
          {controller.flat.map((row: FlatResource) => (
            <ResourceRow
              key={row.item.id}
              row={row}
              active={controller.selectedId === row.item.id}
              expanded={controller.isExpanded(row.item.id)}
              focused={controller.focusedId === row.item.id}
              draggingId={draggingId}
              dropTarget={dropTarget}
              menuOpen={controller.menuOpenId === row.item.id}
              renaming={controller.renamingId === row.item.id}
              hoverActive={hover.hoveredId !== null && !draggingId}
              hoverPill={
                hover.hoveredId === row.item.id &&
                !draggingId &&
                !row.item.disabled
              }
              hoverLayoutId={hover.layoutId}
              onHoverChange={(hovered) => hover.onRowHover(row.item.id, hovered)}
              onFocus={() => controller.focus(row.item.id)}
              onSelect={() => controller.select(row.item.id)}
              onToggle={() => controller.toggleExpanded(row.item.id)}
              onKeyDown={(event) => controller.onRowKeyDown(event, row)}
              onRenameStart={() => controller.startRename(row.item.id)}
              onRenameCancel={controller.cancelRename}
              onRenameCommit={(label) => controller.rename(row.item.id, label)}
              onMenuOpenChange={(open) =>
                open ? controller.openMenu(row.item.id) : controller.closeMenu()
              }
              onDragStart={dnd.onRowDragStart}
              onDragEnd={dnd.onRowDragEnd}
              onDragOver={dnd.onRowDragOver}
              onDrop={dnd.onDrop}
              renderIcon={renderIcon}
              renderMenu={renderMenu}
              renderActionsTrigger={renderActionsTrigger}
              setRef={(node) => controller.setRowRef(row.item.id, node)}
            />
          ))}
        </AnimatePresence>

        {draggingId && (
          <div
            aria-hidden="true"
            data-active={dropTarget?.id === null || undefined}
            className="absolute inset-x-1 bottom-0 flex h-8 items-center justify-center rounded-md border border-dashed border-border text-[10px] text-muted-foreground data-[active=true]:border-primary/50 data-[active=true]:bg-primary/10 data-[active=true]:text-foreground"
          >
            Move to top level
          </div>
        )}
      </div>
      <span className="sr-only" aria-live="polite">
        {controller.announcement}
      </span>
    </>
  )
}
