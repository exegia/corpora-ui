"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "@/components/ui/button"

export type IconButtonProps = Omit<ButtonProps, "variant" | "size" | "glassVariant" | "aria-label"> & {
  /** Required: icon-only controls need a name. */
  "aria-label": string
}

/**
 * 24px ghost control framing a 16px icon.
 *
 * @sketch "Atom / Icon Button"
 */
export function IconButton({ className, ...props }: IconButtonProps): React.ReactElement {
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      className={cn("size-6 rounded-md text-icon hover:bg-surface-subtle hover:text-text-primary sm:size-6 [&_svg]:size-4! [&_svg]:opacity-100", className)}
      {...props}
    />
  )
}

/**
 * Violet "Agent" chip beside the assistant's name.
 *
 * @sketch "Atom / Badge / Agent"
 */
export function AgentBadge({ className, children = "Agent", ...props }: React.ComponentPropsWithoutRef<"span">): React.ReactElement {
  return (
    <span
      data-slot="agent-badge"
      className={cn("inline-flex h-5 shrink-0 items-center rounded-[4px] bg-accent-subtle px-2 text-[11px] font-medium leading-none text-accent-text", className)}
      {...props}
    >
      {children}
    </span>
  )
}
