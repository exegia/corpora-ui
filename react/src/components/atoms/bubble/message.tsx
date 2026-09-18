"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { useBubbleVariant } from "./context"
import type { TBubbleMessageProps } from "./types"
import { twBubbleMessageClasses } from "./utils"
import { containsOnlyAttachments } from "@/lib/attachment-content"

export function BubbleMessage({
  className,
  unstyled,
  children,
  ...props
}: TBubbleMessageProps): React.ReactElement {
  const variant = useBubbleVariant()
  const bare = unstyled ?? containsOnlyAttachments(children)
  return (
    <div
      className={cn(
        "gap-y-2 relative flex-col select-none",
        bare ? "min-w-0 flex max-w-full" : twBubbleMessageClasses[variant],
        className
      )}
      data-slot="bubble-message"
      data-unstyled={bare ? "" : undefined}
      {...props}
    >
      {children}
    </div>
  )
}
