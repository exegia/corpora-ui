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
      <div
        className="rounded-xl rounded-br-sm border-none! py-1.5 px-3 text-xs text-background bg-foreground shadow-bezel"
        // className="max-w-[88%] rounded-xl rounded-br-sm bg-transparent px-3 py-2 text-xs text-foreground"
      >
        {children}
      </div>
    </div>
  )
}
