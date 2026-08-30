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

  return (
    <HighlightPopoverPrimitive
      {...props}
      {...selection.selectionProps}
      renderPopover={() => (
        <HighlightPopover
          component={component ?? popoverComponent}
          componentProps={componentProps ?? popoverProps}
          render={renderPopover}
        >
          {popover}
        </HighlightPopover>
      )}
    >
      {children}
    </HighlightPopoverPrimitive>
  )
}
