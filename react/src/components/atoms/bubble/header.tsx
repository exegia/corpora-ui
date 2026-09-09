"use client"

import { isValidElement } from "react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/user-avatar/component"
import { useBubbleVariant } from "./context"
import type { BubbleAvatarIdentity, BubbleHeaderProps } from "./types"

function isIdentity(
  avatar: BubbleHeaderProps["avatar"]
): avatar is BubbleAvatarIdentity {
  return (
    typeof avatar === "object" &&
    avatar !== null &&
    !isValidElement(avatar) &&
    !Array.isArray(avatar)
  )
}

/** The ai variant's default mark — a spark on the accent disc. */
function SparkAvatar(): React.ReactElement {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-(--chat-ai-accent) text-sm text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35),inset_0_-2px_3px_rgb(0_0_0/0.35)]"
      data-slot="bubble-spark"
    >
      ✦
    </span>
  )
}

/**
 * Author row above a message: avatar, name, time and an optional role badge.
 * The sender variant mirrors the order so the row reads inward from the
 * thread's edge, the same way its bubble does.
 */
export function BubbleHeader({
  name,
  time,
  badge,
  avatar,
  className,
  children,
  ...props
}: BubbleHeaderProps): React.ReactElement {
  const variant = useBubbleVariant()
  const reversed = variant === "sender"

  let avatarNode: React.ReactNode
  if (avatar === undefined) {
    avatarNode =
      variant === "ai" ? (
        <SparkAvatar />
      ) : (
        <UserAvatar
          alt=""
          className="size-8"
          name={typeof name === "string" ? name : ""}
        />
      )
  } else if (isIdentity(avatar)) {
    avatarNode = (
      <UserAvatar
        alt=""
        className="size-8"
        initials={avatar.initials}
        name={avatar.name ?? (typeof name === "string" ? name : "")}
        src={avatar.src}
      />
    )
  } else {
    avatarNode = avatar
  }

  const badgeNode =
    typeof badge === "string" || typeof badge === "number" ? (
      <Badge variant={variant === "ai" ? "accent" : "neutral"}>{badge}</Badge>
    ) : (
      badge
    )

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
      {avatarNode}
      <div
        className={cn(
          "flex min-w-0 flex-col justify-center gap-0.5",
          reversed && "items-end text-right"
        )}
      >
        <span
          className="truncate text-xs leading-none font-bold text-foreground"
          data-slot="bubble-author"
        >
          {name}
        </span>
        {time !== undefined && time !== null ? (
          <span
            className="text-[10px] leading-none font-semibold text-muted-foreground"
            data-slot="bubble-time"
          >
            {time}
          </span>
        ) : null}
      </div>
      {badgeNode}
      {children}
    </div>
  )
}
