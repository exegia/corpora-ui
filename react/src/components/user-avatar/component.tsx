"use client"

import * as React from "react"

import {
  Avatar,
  AvatarImage,
  type AvatarPrimitive,
} from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Fallback } from "./fallback"

/**
 * Identity avatar: an image when one is given, initials otherwise.
 *
 * A passed `src` is assumed to be remote, so the slot holds a skeleton until
 * the image resolves rather than flashing initials that are about to be
 * replaced. A failed load settles on the initials.
 */
export function UserAvatar({
  src,
  name = "",
  initials,
  alt,
  loading: loadingProp,
  className,
  ...props
}: UserAvatarProps): React.ReactElement {
  const [status, setStatus] = React.useState<ImageStatus>("idle")
  const loading =
    loadingProp ??
    (src !== undefined && (status === "idle" || status === "loading"))

  return (
    <Avatar
      className={cn(
        "size-8 border-2 border-white bg-neutral-800 text-xl",
        className
      )}
      data-loading={loading || undefined}
      data-slot="user-avatar"
      {...props}
    >
      {/* Held back while forced-loading: a loaded image would hide the
          fallback the skeleton lives in. */}
      {src === undefined || loadingProp === true ? null : (
        <AvatarImage
          alt={alt ?? name}
          onLoadingStatusChange={setStatus}
          src={src}
        />
      )}
      <Fallback name={name} initials={initials} loading={loading} />
    </Avatar>
  )
}
