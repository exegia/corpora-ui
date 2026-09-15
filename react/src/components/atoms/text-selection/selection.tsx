"use client"

import type { ReactElement } from "react"
import { HighlightPopover as HighlightPopoverPrimitive } from "@omsimos/react-highlight-popover"
import { HighlightPopover } from "./popover"
import { useSelection } from "./use-selection"
import type { TextSelectionProps } from "./types"

export function TextSelection({
  children,
  selected,
  popover,
  component,
  componentProps,
  popoverComponent,
  popoverProps,
  renderPopover,
  onSelectionStart,
  onSelectionEnd,
  onPopoverShow,
  onPopoverHide,
  ...props
}: TextSelectionProps): ReactElement {
  const selection = useSelection({
    selected,
    onSelectionStart,
    onSelectionEnd,
    onPopoverShow,
    onPopoverHide,
  })
  const hasPopover =
    renderPopover !== undefined ||
    component !== undefined ||
    popoverComponent !== undefined ||
    (popover !== undefined && popover !== null)

  return (
    <HighlightPopoverPrimitive
      {...props}
      {...selection.selectionProps}
      renderPopover={() =>
        hasPopover ? (
          <HighlightPopover
            component={component ?? popoverComponent}
            componentProps={componentProps ?? popoverProps}
            render={renderPopover}
          >
            {popover}
          </HighlightPopover>
        ) : null
      }
    >
      {children}
    </HighlightPopoverPrimitive>
  )
}
