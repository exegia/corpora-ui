"use client"

import { useState } from "react"
import type { ReactElement } from "react"
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover-popup"
import { cn } from "@/lib/utils"
import { Text } from "../text/default"
import type { TextClickPopoverProps, TextPopoverRenderProps } from "./types"

export function TextClickPopover({
  children,
  popover,
  renderPopover,
  popoverProps,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  className,
  ...textProps
}: TextClickPopoverProps): ReactElement {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = (next: boolean) => {
    setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  const renderProps: TextPopoverRenderProps = {
    open,
    setOpen,
    close: () => setOpen(false),
  }
  const content = renderPopover ? renderPopover(renderProps) : popover

  return (
    <Popover onOpenChange={(next) => setOpen(next)} open={open}>
      <PopoverTrigger
        nativeButton={false}
        render={
          <Text
            {...textProps}
            className={cn(
              "w-fit cursor-pointer data-popup-open:opacity-80",
              className
            )}
          />
        }
      >
        {children}
      </PopoverTrigger>
      {content !== undefined && content !== null ? (
        <PopoverPopup
          {...popoverProps}
          className={cn("max-w-64", popoverProps?.className)}
          data-selection-popover=""
        >
          {content}
        </PopoverPopup>
      ) : null}
    </Popover>
  )
}
