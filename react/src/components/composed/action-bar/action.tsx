import { ToolbarButton, ToolbarSeparator } from "@/components/ui/toolbar"
import type { IActionButtonProps } from "./types"
import { TooltipTrigger } from "@/components/ui/tooltip"
import { useContext } from "react"
import { ActionTooltipContext } from "./utils"
import type { ToolbarSeparatorProps } from "@base-ui/react"

export function Action({
  tooltip,
  action,
  Icon,
}: Omit<IActionButtonProps<string>, "children">) {
  const tooltipHandle = useContext(ActionTooltipContext)
  return (
    <TooltipTrigger
      handle={tooltipHandle}
      payload={tooltip}
      // The icon is aria-hidden, so without this the button has no accessible
      // name at all — `data-tooltip` is not exposed to assistive tech.
      render={
        <ToolbarButton
          aria-label={tooltip}
          data-tooltip={tooltip}
          onClick={action}
        />
      }
    >
      {"emoji" in Icon ? (
        <span>{Icon.emoji}</span>
      ) : (
        <Icon size={18} aria-hidden="true" />
      )}
    </TooltipTrigger>
  )
}

/**
 * Group boundary. Pass it under a `separator-*` key in `actions` and the bar
 * wraps the runs of actions either side of it in their own `ToolbarGroup`.
 */
export function Separator(props: ToolbarSeparatorProps) {
  return <ToolbarSeparator orientation="vertical" {...props} />
}

/**
 * An action labelled by an emoji glyph rather than a Lucide icon. The glyph is
 * `aria-hidden` — `label` is the accessible name, so a screen reader reads
 * "thumbs up" rather than announcing the character.
 */
export function EmojiAction({
  emoji,
  label,
  action,
}: {
  emoji: string
  label: string
  action: () => void
}) {
  const tooltipHandle = useContext(ActionTooltipContext)
  return (
    <TooltipTrigger
      handle={tooltipHandle}
      payload={label}
      render={
        <ToolbarButton
          aria-label={label}
          className="size-8 text-base hover:bg-black/6 dark:hover:bg-white/10 cursor-pointer rounded-full leading-none outline-0! transition-[background-color,scale] duration-150 ease-smooth-out focus-visible:bg-transparent active:scale-90 motion-reduce:transition-none motion-reduce:active:scale-100"
          data-emoji={emoji}
          data-tooltip={label}
          onClick={action}
        />
      }
    >
      <span aria-hidden="true">{emoji}</span>
    </TooltipTrigger>
  )
}
