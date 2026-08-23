"use client"

import * as React from "react"

import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Fallback } from "./fallback"
import { PresenceBadge } from "./presence-badge"
import type { UserAvatarProps } from "./type"
import { useUserAvatar } from "./use-user-avatar"
import { bezelAlphasForTone } from "./utils"

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
/** The rim (and the badge sheen) trail the pointer's bearing slightly rather
 * than pointing dead at it — a touch of lag reads as weight. */
const BEZEL_DAMPING = 0.8

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
    src,
  })
  const { presence, bezelAngle, imageStatus, imageTone, setImageStatus, ref } =
    avatar

  const loading =
    loadingProp ??
    (hasImage && (imageStatus === "idle" || imageStatus === "loading"))
  // A photo is actually on screen — not merely requested. A broken or
  // still-loading `src` shows initials/skeleton and should be treated as
  // the flat disc it is.
  const showsImage = hasImage && loadingProp !== true && imageStatus === "loaded"
  // With a photo on screen and its rim sampled, the bezel's alphas follow the
  // photo rather than the theme: the ring sits on the image, not the page.
  const bezelAlphas =
    showsImage && imageTone !== null ? bezelAlphasForTone(imageTone) : null

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
          // `@container` lets the fallback size its initials in cqw — a
          // fraction of whatever `size-*` the caller put on this element —
          // instead of a fixed text step. `text-xl` stays as the fallback for
          // engines without container units.
          "@container size-8 border-1 border-white bg-neutral-800! text-xl dark:border-neutral-900",
          // The emboss itself: an inset drop toward the light's opposite side
          // is what the ring below is rotated against.
          bezel &&
            "shadow-[inset_0_3px_3px_--theme(--color-white/80%),inset_0_-1px_2px_--theme(--color-black/15%)] dark:shadow-[inset_0_1px_1px_--theme(--color-white/5%),inset_0_-8px_2px_--theme(--color-black/20%)]",
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
      {presence === "online" ? (
        // The badge's green "reflected" onto the disc: a static radial wash
        // anchored at the badge corner that fades inward, so the dot reads
        // as a light source sitting on the avatar rather than a sticker on
        // it. Does not move with the bezel — it belongs to the badge, not
        // the pointer. Sits above the image, below the bezel and the badge.
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full",
            // One gradient, four knobs: colour, peak alpha, mid alpha, reach.
            // Light mode is quieter than dark (a green wash on a pale disc
            // reads as a stain, on a dark one as a glow), and an initials
            // disc — flat, no photo to sit on — takes a smaller, fainter
            // pool than an image does.
            "[--reflect:--theme(--color-emerald-500)] dark:[--reflect:--theme(--color-emerald-400)]",
            showsImage
              ? "[--reflect-peak:30%] [--reflect-mid:12%] [--reflect-reach:56%] dark:[--reflect-peak:40%] dark:[--reflect-mid:16%] dark:[--reflect-reach:60%]"
              : "[--reflect-peak:16%] [--reflect-mid:6%] [--reflect-reach:40%] dark:[--reflect-peak:26%] dark:[--reflect-mid:9%] dark:[--reflect-reach:46%]",
            "bg-[radial-gradient(circle_at_88%_88%,color-mix(in_oklab,var(--reflect)_var(--reflect-peak),transparent)_0%,color-mix(in_oklab,var(--reflect)_var(--reflect-mid),transparent)_22%,transparent_var(--reflect-reach))]",
            "transition-opacity duration-150 ease-smooth-out"
          )}
          data-image={showsImage ? "" : undefined}
          data-slot="user-avatar-reflection"
        />
      ) : null}
      {bezel ? (
        // A conic highlight → shadow sweep, masked to a thin rim and rotated
        // so the highlight faces the pointer. Rotation (not the gradient
        // angle) is what moves, because `transform` transitions and a
        // gradient stop does not. The highlight is white and the shadow
        // black at alphas `--bezel-hi-a` / `--bezel-lo-a`: light and dark
        // pick their own defaults (a white rim glares on a dark page), and a
        // sampled photo overrides both inline so the ring is weighted against
        // the image it actually sits on — scaled by `--bezel-hi-k`, because
        // the rim borders the page as much as the photo and the same white
        // that lifts a dark portrait off a light page glares on a dark one.
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full",
            "[--bezel-hi-a:1] [--bezel-lo-a:0.2] dark:[--bezel-hi-a:0.18] dark:[--bezel-lo-a:0.4]",
            "[--bezel-hi-k:1] dark:[--bezel-hi-k:0.55]",
            "[--bezel-hi:color-mix(in_oklab,white_calc(var(--bezel-hi-a)*100%),transparent)]",
            "[--bezel-lo:color-mix(in_oklab,black_calc(var(--bezel-lo-a)*100%),transparent)]",
            // Starts at 6 o'clock: shadow there, highlight peaking at 12 (50%),
            // symmetric either side — so rotate(angle) puts the highlight at
            // exactly `bezelAngle` clockwise from 12.
            "bg-[conic-gradient(from_180deg,var(--bezel-lo)_0%,transparent_24%,transparent_28%,var(--bezel-hi)_50%,transparent_72%,transparent_76%,var(--bezel-lo)_100%)]",
            // Rim width is a share of the radius, not a px count, so the
            // bezel reads the same at size-8 and size-16: solid over the outer
            // 8%, feathering in over the 14% inside that.
            "[mask-image:radial-gradient(farthest-side,transparent_78%,#000_92%)]",
            "mix-blend-normal transition-transform duration-150 ease-smooth-out motion-reduce:transition-none"
          )}
          data-slot="user-avatar-bezel"
          data-tone={imageTone === null ? undefined : imageTone.toFixed(2)}
          style={{
            transform: `rotate(${bezelAngle * BEZEL_DAMPING}deg)`,
            ...(bezelAlphas
              ? {
                  "--bezel-hi-a": `calc(${bezelAlphas.hi.toFixed(2)} * var(--bezel-hi-k))`,
                  "--bezel-lo-a": bezelAlphas.lo.toFixed(2),
                }
              : null),
          }}
        />
      ) : null}
      {presence ? (
        <PresenceBadge
          lightAngle={bezel ? bezelAngle * BEZEL_DAMPING : undefined}
          presence={presence}
        />
      ) : null}
    </span>
  )
}
