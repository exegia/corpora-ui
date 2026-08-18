"use client"

import * as React from "react"

import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Fallback } from "./fallback"
import { PresenceBadge } from "./presence-badge"
import type { UserAvatarProps } from "./type"
import { useUserAvatar } from "./use-user-avatar"

/**
 * Identity avatar: an image when one is given, initials otherwise, with an
 * optional presence badge and a pointer-lit bezel.
 *
 * A passed `src` is assumed to be remote, so the slot holds a skeleton until
 * the image resolves rather than flashing initials that are about to be
 * replaced. A failed load settles on the initials.
 *
 * State (presence, bezel angle, image status) lives in Jotai atoms keyed by
 * `avatarId` — name the avatar and `useUserAvatarActions(id).setPresence()`
 * flips its badge from anywhere under `ExegiaProvider`.
 */
export function UserAvatar({
  src,
  name = "",
  initials,
  alt,
  loading: loadingProp,
  presence: presenceProp,
  bezel = true,
  avatarId,
  className,
  style,
  ...props
}: UserAvatarProps): React.ReactElement {
  const hasImage = src !== undefined
  const avatar = useUserAvatar({
    avatarId,
    presence: presenceProp,
    bezel,
    hasImage,
  })
  const { presence, bezelAngle, imageStatus, setImageStatus, ref } = avatar

  const loading =
    loadingProp ??
    (hasImage && (imageStatus === "idle" || imageStatus === "loading"))

  return (
    // The frame is what the badge and bezel hang off: the Avatar root clips
    // to its circle, and the badge has to sit on the rim, half outside it.
    // Sizing classes still target the Avatar — the frame shrink-wraps it.
    <span
      className="relative inline-flex shrink-0 rounded-full"
      data-slot="user-avatar-frame"
      ref={ref as React.RefObject<HTMLSpanElement>}
    >
      <Avatar
        className={cn(
          "size-8 border-2 border-white bg-neutral-800 text-xl",
          // The emboss itself: an inset drop toward the light's opposite side
          // is what the ring below is rotated against.
          bezel &&
            "shadow-[inset_0_1px_1px_--theme(--color-white/40%),inset_0_-1px_2px_--theme(--color-black/25%)] dark:shadow-[inset_0_1px_1px_--theme(--color-white/12%),inset_0_-1px_2px_--theme(--color-black/60%)]",
          className
        )}
        data-avatar-id={avatar.avatarId}
        data-bezel={bezel ? "" : undefined}
        data-loading={loading || undefined}
        data-presence={presence ?? undefined}
        data-slot="user-avatar"
        style={style}
        {...props}
      >
        {/* Held back while forced-loading: a loaded image would hide the
            fallback the skeleton lives in. */}
        {!hasImage || loadingProp === true ? null : (
          <AvatarImage
            alt={alt ?? name}
            onLoadingStatusChange={setImageStatus}
            src={src}
          />
        )}
        <Fallback name={name} initials={initials} loading={loading} />
      </Avatar>
      {bezel ? (
        // A conic highlight → shadow sweep, masked to a thin rim and rotated
        // so the highlight faces the pointer. Rotation (not the gradient
        // angle) is what moves, because `transform` transitions and a
        // gradient stop does not. Light and dark pick their own alphas via
        // the two CSS vars; the gradient reads them.
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full",
            "[--bezel-hi:--theme(--color-white/85%)] [--bezel-lo:--theme(--color-black/28%)]",
            "dark:[--bezel-hi:--theme(--color-white/38%)] dark:[--bezel-lo:--theme(--color-black/70%)]",
            // Starts at 6 o'clock: shadow there, highlight peaking at 12 (50%),
            // symmetric either side — so rotate(angle) puts the highlight at
            // exactly `bezelAngle` clockwise from 12.
            "bg-[conic-gradient(from_180deg,var(--bezel-lo)_0%,transparent_24%,transparent_28%,var(--bezel-hi)_50%,transparent_72%,transparent_76%,var(--bezel-lo)_100%)]",
            "[mask-image:radial-gradient(farthest-side,transparent_calc(100%-3px),#000_calc(100%-2px))]",
            "mix-blend-normal transition-transform duration-150 ease-smooth-out motion-reduce:transition-none"
          )}
          data-slot="user-avatar-bezel"
          style={{ transform: `rotate(${bezelAngle}deg)` }}
        />
      ) : null}
      {presence ? <PresenceBadge presence={presence} /> : null}
    </span>
  )
}
