import type * as React from "react"

import type { AvatarPrimitive } from "@/components/ui/avatar"

export type ImageStatus = Parameters<
  NonNullable<AvatarPrimitive.Image.Props["onLoadingStatusChange"]>
>[0]

/** Whether the person is reachable right now — drawn as the corner badge. */
export type UserPresence = "online" | "offline"

/** Key for one avatar's state in the store. Any stable string; `useUserAvatar`
 * generates one when the component does not name itself. */
export type UserAvatarInstanceId = string

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
  /**
   * Corner badge: a green dot for `online`, a hollow grey ring for `offline`.
   * Omitted, no badge — unless the avatar is driven by id and something set
   * its presence in the store. Controlled when passed.
   */
  presence?: UserPresence
  /**
   * Embossed rim whose highlight follows the pointer, so the avatar reads as
   * a lit bezel rather than a flat disc. Light and dark aware, and with a
   * photo it samples the image's rim lightness (CORS permitting) to weight
   * highlight against shadow, so the emboss reads on a dark portrait and a
   * pale one alike. Static under reduced motion. On by default — pass
   * `false` for a flat disc.
   */
  bezel?: boolean
  /**
   * Name this avatar's slice of the store so `useUserAvatarState(id)` /
   * `useUserAvatarActions(id)` can read or drive it from anywhere under
   * `ExegiaProvider`. Unnamed avatars key off `useId` and are dropped on
   * unmount.
   */
  avatarId?: UserAvatarInstanceId
}

/** Everything the store knows about one avatar. */
export interface UserAvatarState {
  presence: UserPresence | null
  /** Bezel light direction in degrees, clockwise from 12 o'clock. Continuous
   * (may leave [0, 360)) so the rim's CSS rotation never spins the long way;
   * `((a % 360) + 360) % 360` if you need it normalised. */
  bezelAngle: number
  imageStatus: ImageStatus
  /** Perceived lightness of the loaded image's rim, 0 (black) → 1 (white),
   * or `null` while unknown — no image yet, or one that could not be sampled
   * (non-CORS host, no canvas). The bezel's highlight/shadow alphas follow
   * it so the emboss reads on a dark photo and a pale one alike. */
  imageTone: number | null
}

/** Write-only handles onto one avatar. Nothing here re-renders the caller. */
export interface UserAvatarActions {
  setPresence: (presence: UserPresence | null) => void
  togglePresence: () => void
  setBezelAngle: (angle: number) => void
  reset: () => void
}

/** @internal Which fields the mounted component controls from props. The
 * store must never overwrite a controlled value. */
export interface UserAvatarConfig {
  controlsPresence: boolean
}

export interface IAudioWaveProps {
  className?: string
  children?: React.ReactNode
  volume?: number
}
