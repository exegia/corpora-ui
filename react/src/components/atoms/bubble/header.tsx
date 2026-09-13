"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { useBubbleVariant } from "./context"
import type { BubbleHeaderProps } from "./types"
import { Avatar } from "@/components/atoms/avatar"
import { Badge } from "@/components/ui/badge"
import OWLImage from "@/assets/owl-avatar.png"

/**
 * Author row above a message: avatar, name, time and an optional role badge.
 * The sender variant mirrors the order so the row reads inward from the
 * thread's edge, the same way its bubble does.
 */
export function BubbleHeader({
  className,
  children,
  ...props
}: BubbleHeaderProps): React.ReactElement {
  const variant = useBubbleVariant()
  const reversed = variant === "sender"

  const renderAIAvatar = () => {
    return (
      <div className="flex items-center gap-2">
        <Avatar size="md" className="bg-indigo-950 dark:bg-indigo-300 p-0.5 scale-110" user={{ avatarUrl: OWLImage }} />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold">Exegia</span>
            <Badge variant="default" size="xs">
              Agent
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">AI Scholar</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        reversed && "flex-row-reverse",
        className
      )}
      data-slot="bubble-header"
      {...props}
    >
      {variant === "ai" ? renderAIAvatar() : children}
    </div>
  )
}
