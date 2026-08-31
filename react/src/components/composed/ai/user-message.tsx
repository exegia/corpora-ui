"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

export interface UserMessageProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children"
> {
  children: React.ReactNode
}

export function UserMessage({
  children,
  className,
  ...props
}: UserMessageProps): React.ReactElement {
  return (
    <div className={cn("flex justify-end", className)} {...props}>
      <div className="max-w-[88%] rounded-2xl rounded-br-sm bg-muted px-3.5 py-2.5 text-sm text-foreground">
        {children}
      </div>
    </div>
  )
}
