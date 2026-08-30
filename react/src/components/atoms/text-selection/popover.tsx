"use client"

import { useEffect } from "react"
import type * as React from "react"
import { useHighlightPopover } from "@omsimos/react-highlight-popover"
import { Card, CardPanel } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useSelection } from "./use-selection"
import type { HighlightPopoverProps, SelectionRenderProps } from "./types"

export function HighlightPopover({
  children,
  component: Component = Card,
  componentProps,
  render,
  className,
  ...props
}: HighlightPopoverProps): React.ReactElement {
  const primitive = useHighlightPopover()
  const selection = useSelection()
  const currentSelection =
    primitive.currentSelection || selection.currentSelection
  const position = selection.popoverPosition ?? primitive.popoverPosition
  const {
    currentSelection: stateSelection,
    popoverPosition: statePosition,
    selected,
    setPosition,
    setSelection,
    setShowPopover,
    showPopover,
  } = selection

  useEffect(() => {
    if (stateSelection !== currentSelection) {
      setSelection(currentSelection)
    }
    if (
      statePosition?.top !== primitive.popoverPosition.top ||
      statePosition?.left !== primitive.popoverPosition.left
    ) {
      setPosition(primitive.popoverPosition)
    }
    if (showPopover !== primitive.showPopover) {
      setShowPopover(primitive.showPopover)
    }
  }, [
    currentSelection,
    primitive.popoverPosition,
    primitive.showPopover,
    setPosition,
    setSelection,
    setShowPopover,
    showPopover,
    statePosition,
    stateSelection,
  ])

  const renderProps: SelectionRenderProps = {
    position,
    selection: currentSelection,
    selected,
    showPopover: primitive.showPopover,
    setCurrentSelection: (value) => {
      primitive.setCurrentSelection(value)
      setSelection(value)
    },
    setShowPopover: (show) => {
      primitive.setShowPopover(show)
      setShowPopover(show)
    },
    close: () => {
      primitive.setShowPopover(false)
      setShowPopover(false)
    },
  }

  const content = render ? render(renderProps) : children
  const forwardedClassName =
    typeof componentProps?.className === "string"
      ? componentProps.className
      : undefined
  const componentContextProps =
    typeof Component === "string" || Component === Card ? {} : renderProps
  return (
    <Component
      {...componentProps}
      {...props}
      {...componentContextProps}
      className={cn(
        "max-w-52 rounded-md bg-white/50 shadow-lg inset-shadow-sm shadow-black/10 inset-shadow-popover backdrop-blur-md dark:bg-black/20",
        forwardedClassName,
        className
      )}
      data-selection-popover=""
    >
      <CardPanel className="p-3">{content}</CardPanel>
    </Component>
  )
}
