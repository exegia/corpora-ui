"use client"

import {
  Toolbar as ToolbarPrimitive,
  ToolbarGroup,
} from "@/components/ui/toolbar"
import { Tooltip, TooltipPopup } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { tooltipHandle, useActionBar } from "./utils"
import type { ActionBarProps } from "./types"

/**
 * Toolbar chrome. "default" keeps the bordered card surface; "ghost" and
 * "glass" drop it so the bar can sit inside a surface that already paints one
 * — a `PopoverPopup variant="glass"`, for instance.
 */
const toolbarVariants = {
  default: "",
  ghost: "border-0 bg-transparent shadow-none",
  glass: "border-0 bg-transparent p-0 shadow-none",
} as const

export default function Toolbar({
  id,
  actions,
  variant = "default",
  className,
}: ActionBarProps) {
  const { segments, entries, hasGroups } = useActionBar({ actions })

  return (
    <ToolbarPrimitive
      className={cn(toolbarVariants[variant], className)}
      data-slot="action-bar"
      data-variant={variant}
      id={id}
    >
      {hasGroups
        ? segments.map((segment) =>
            segment.type === "separator" ? (
              <segment.Separator key={segment.key} />
            ) : (
              <ToolbarGroup key={segment.key}>
                {segment.items.map(([key, Action]) => (
                  <Action key={key} />
                ))}
              </ToolbarGroup>
            )
          )
        : entries.map(([key, Action]) => <Action key={key} />)}
      <Tooltip handle={tooltipHandle}>
        {({ payload: Payload, ...props }) => (
          <TooltipPopup {...props}>
            {Payload !== undefined && <Payload />}
          </TooltipPopup>
        )}
      </Tooltip>
    </ToolbarPrimitive>
  )
}
