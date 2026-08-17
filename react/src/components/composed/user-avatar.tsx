"use client"

import * as React from "react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  type AvatarPrimitive,
} from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type ImageStatus = Parameters<
  NonNullable<AvatarPrimitive.Image.Props["onLoadingStatusChange"]>
>[0]

export interface UserAvatarProps extends Omit<
  AvatarPrimitive.Root.Props,
  "children"
> {
  /** Image URL. Without one the initials show immediately — no skeleton. */
  src?: string
  /** Drives the initials, and the alt text unless `alt` overrides it. */
  name?: string
  /** Overrides the initials derived from `name`. */
  initials?: string
  /**
   * Alt text for the image. Pass "" when adjacent text already names the
   * person — the image is then decorative.
   */
  alt?: string
  /**
   * Force the skeleton, for when the identity itself is still being fetched.
   * Omitted, it follows the image: a passed `src` skeletons until it resolves.
   */
  loading?: boolean
}

/** "Jenny Hamilton" → "JH", "luna" → "L". */
export function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ""
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : ""
  return (first + last).toUpperCase()
}

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
        "size-8 border-t-3 border-l-2 border-white/20 text-xl inset-shadow-sm inset-shadow-black outline-2 outline-offset-3 outline-sidebar-foreground/20",
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
      <AvatarFallback>
        {loading ? (
          <Skeleton
            className="size-full rounded-full"
            data-slot="avatar-skeleton"
          />
        ) : (
          <span className="text-headline">
            {initials ?? initialsFrom(name)}
          </span>
        )}
      </AvatarFallback>
    </Avatar>
  )
}
