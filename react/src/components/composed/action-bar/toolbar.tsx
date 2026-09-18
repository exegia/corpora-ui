"use client"

import {
  Toolbar as ToolbarPrimitive,
  ToolbarGroup,
} from "@/components/ui/toolbar"
import { useState } from "react"
import {
  Tooltip,
  TooltipCreateHandle,
  TooltipPopup,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { ActionTooltipContext, useActionBar } from "./utils"
import type { IActionBarProps } from "./types"

/**
 * Toolbar chrome. "default" keeps the bordered card surface; "ghost" and
 * "glass" drop it so the bar can sit inside a surface that already paints one
 * — a `PopoverGlass variant="glass"`, for instance.
 */
const toolbarVariants = {
  default: "border-none bg-transparent backdrop-blur-none!",
  ghost: "border-0 bg-transparent! shadow-none",
  glass: "border-0 bg-transparent! shadow-sm shadow-black",
} as const

export default function Toolbar({
  id,
  actions,
  variant = "default",
  className,
}: IActionBarProps) {
  const { segments, entries, hasGroups } = useActionBar({ actions })
  const [tooltipHandle] = useState(() => TooltipCreateHandle<string>())

  return (
    <ActionTooltipContext value={tooltipHandle}>
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
          {({ payload, ...props }) => (
            <TooltipPopup {...props}>{payload}</TooltipPopup>
          )}
        </Tooltip>
      </ToolbarPrimitive>
    </ActionTooltipContext>
  )
}
