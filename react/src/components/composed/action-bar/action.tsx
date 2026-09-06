import { ToolbarButton, ToolbarSeparator } from "@/components/ui/toolbar"
import type { ActionButtonProps } from "./types"
import { TooltipTrigger } from "@/components/ui/tooltip"
import { Text } from "@/components/atoms"
import type { SpanProps } from "@/components/atoms/text"
import { tooltipHandle } from "./utils"
import type { ToolbarSeparatorProps } from "@base-ui/react"

function Payload({ children }: SpanProps) {
  return <Text.Span>{children}</Text.Span>
}

export function Action({
  tooltip,
  action,
  Icon,
}: Omit<ActionButtonProps<string>, "children">) {
  return (
    <TooltipTrigger
      handle={tooltipHandle}
      payload={Payload}
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
  return (
    <TooltipTrigger
      handle={tooltipHandle}
      payload={Payload}
      render={
        <ToolbarButton
          aria-label={label}
          className="size-8 cursor-pointer rounded-full text-base leading-none outline-0! transition-[background-color,scale] duration-150 ease-smooth-out hover:bg-black/6 focus-visible:bg-transparent active:scale-90 motion-reduce:transition-none motion-reduce:active:scale-100 dark:hover:bg-white/10"
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
