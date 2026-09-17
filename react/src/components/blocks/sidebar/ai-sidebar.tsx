"use client"

import { useMemo } from "react"
import { AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import type {
  AISidebarComponentProps,
  AISidebarContextValue,
  AISidebarController,
  AISidebarProps,
  AISidebarViewProps,
  FlatResource,
} from "./type"
import { useAISidebar } from "./use-ai-sidebar"
import { AISidebarContext } from "./sidebar-context"
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

  // Rows take the sidebar's id and the stable handlers, never the controller
  // — so this value keeps its identity and a hover or a toggle re-renders
  // only the rows whose own atoms changed. Deps name each function because
  // `dnd` itself carries live drag state and changes identity with it.
  const context = useMemo<AISidebarContextValue>(
    () => ({
      sidebarId: controller.sidebarId,
      hoverLayoutId: hover.layoutId,
      renderIcon,
      renderMenu,
      renderActionsTrigger,
      setRowRef: controller.setRowRef,
      onRowKeyDown: controller.onRowKeyDown,
      onRowHover: hover.onRowHover,
      closeMenu: controller.closeMenu,
      dnd: {
        onDrop: dnd.onDrop,
        onRowDragStart: dnd.onRowDragStart,
        onRowDragEnd: dnd.onRowDragEnd,
        onRowDragOver: dnd.onRowDragOver,
      },
    }),
    [
      controller.sidebarId,
      controller.setRowRef,
      controller.onRowKeyDown,
      controller.closeMenu,
      hover.layoutId,
      hover.onRowHover,
      renderIcon,
      renderMenu,
      renderActionsTrigger,
      dnd.onDrop,
      dnd.onRowDragStart,
      dnd.onRowDragEnd,
      dnd.onRowDragOver,
    ]
  )

  return (
    <AISidebarContext.Provider value={context}>
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
            <ResourceRow key={row.item.id} row={row} />
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
    </AISidebarContext.Provider>
  )
}
