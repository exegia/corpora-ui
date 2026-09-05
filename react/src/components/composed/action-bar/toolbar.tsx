"use client"

import {
  Toolbar as ToolbarPrimitive,
  ToolbarGroup,
} from "@/components/ui/toolbar"
import { Tooltip, TooltipPopup } from "@/components/ui/tooltip"
import { tooltipHandle, useActionBar } from "./utils"
import type { ActionBarProps } from "./types"

export default function Toolbar({ id, actions }: ActionBarProps) {
  const { segments, entries, hasGroups } = useActionBar({ actions })

  return (
    <ToolbarPrimitive id={id}>
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
