"use client"

import type { MouseEvent as ReactMouseEvent, ReactElement } from "react"
import { Popover, PopoverPopup } from "@/components/ui/popover"
import { PopoverGlass } from "@/components/ui/popover-glass"
import { cn } from "@/lib/utils"
import type { IAnchoredPopoverProps, IAnchoredPopoverRenderProps } from "./type"

/**
 * Keep the reader's selection alive while they press a toolbar button inside
 * the popup: a mousedown would otherwise collapse it (and close a
 * selection-triggered popover) before the click lands. Form controls still
 * need the default so they can take focus.
 */
function preserveSelection(event: ReactMouseEvent<HTMLElement>): void {
  const target = event.target as Element
  if (target.closest("input, textarea, select, [contenteditable]")) return
  event.preventDefault()
}

/**
 * A popover with no trigger. `useAnchoredPopover` supplies `open`, the
 * virtual `anchor` and the dismiss handler through `popoverProps`; Base UI
 * does the positioning, portal, Escape and outside-press handling.
 */
export function AnchoredPopover<TPayload = unknown>({
  id,
  open,
  anchor,
  text,
  payload,
  onOpenChange,
  onPopupPointerEnter,
  onPopupPointerLeave,
  children,
  className,
  side = "top",
  variant,
  glassVariant,
  ...popupProps
}: IAnchoredPopoverProps<TPayload>): ReactElement {
  const renderProps: IAnchoredPopoverRenderProps<TPayload> = {
    open,
    text,
    payload,
    setOpen: (next) => onOpenChange(next),
    close: () => onOpenChange(false),
  }
  const content = typeof children === "function" ? children(renderProps) : children

  const shared = {
    ...popupProps,
    anchor: anchor ?? undefined,
    side,
    className: cn("max-w-64", className),
    onMouseDown: preserveSelection,
    onPointerEnter: onPopupPointerEnter,
    onPointerLeave: onPopupPointerLeave,
    "data-selection-popover": "",
    "data-anchored-popover": id,
  }

  return (
    <Popover onOpenChange={onOpenChange} open={open}>
      {variant === "glass" ? (
        <PopoverGlass {...shared} glassVariant={glassVariant}>
          {content}
        </PopoverGlass>
      ) : (
        <PopoverPopup {...shared}>{content}</PopoverPopup>
      )}
    </Popover>
  )
}
