"use client"

import { Play, Plus, X } from "lucide-react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "@/components/ui/button"

type IconButtonProps = Omit<ButtonProps, "variant" | "size" | "glassVariant" | "children">

/**
 * 18px filled circle with an inverse ✕, used on composer chips.
 *
 * @sketch "Atom / Button / Remove"
 */
export function RemoveButton({ className, ...props }: IconButtonProps): React.ReactElement {
  return (
    <Button
      aria-label="Remove"
      variant="ghost"
      size="icon-xs"
      className={cn(
        "size-[18px] rounded-full border-0 bg-text-primary text-text-inverse hover:bg-text-primary/85 sm:size-[18px] [&_svg]:size-2.5! [&_svg]:opacity-100",
        className
      )}
      {...props}
    >
      <X strokeWidth={3} />
    </Button>
  )
}

/**
 * 36px scrim circle with a white play glyph, centred on media previews.
 *
 * @sketch "Atom / Button / Play"
 */
export function PlayButton({ className, ...props }: IconButtonProps): React.ReactElement {
  return (
    <Button
      aria-label="Play"
      variant="ghost"
      size="icon"
      className={cn(
        "size-9 rounded-full border-0 bg-overlay-scrim text-overlay-on-media hover:bg-overlay-scrim/80 sm:size-9 [&_svg]:size-3.5! [&_svg]:translate-x-px [&_svg]:fill-current [&_svg]:opacity-100",
        className
      )}
      {...props}
    >
      <Play />
    </Button>
  )
}

/**
 * 26px ghost "+" for the composer's attach action.
 *
 * @sketch "Atom / Button / Add"
 */
export function AddButton({ className, ...props }: IconButtonProps): React.ReactElement {
  return (
    <Button
      aria-label="Add attachment"
      variant="ghost"
      size="icon-xs"
      className={cn("size-[26px] rounded-md text-icon sm:size-[26px] [&_svg]:size-4!", className)}
      {...props}
    >
      <Plus />
    </Button>
  )
}

export type SendButtonProps = Omit<ButtonProps, "variant" | "glassVariant">

/**
 * Brand-yellow 61×31 pill, radius 8, dark label.
 *
 * @sketch "Atom / Button / Send"
 */
export function SendButton({ className, children = "Send", ...props }: SendButtonProps): React.ReactElement {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-[31px] rounded-md border-0 bg-brand px-4 text-[13px] font-semibold text-[#1a1a1a] shadow-none hover:bg-brand/90 data-pressed:bg-brand/90 sm:h-[31px] *:data-[slot=button-loading-indicator]:text-[#1a1a1a]",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}
