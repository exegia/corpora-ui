"use client"

import * as React from "react"
import { useAtomValue, useSetAtom } from "jotai"
import { useReducedMotion } from "motion/react"

import type {
  ImageStatus,
  UserAvatarConfig,
  UserAvatarInstanceId,
  UserPresence,
} from "./type"
import {
  projectUserAvatarPropsAtom,
  removeUserAvatarInstance,
  setUserAvatarBezelAngleAtom,
  setUserAvatarImageStatusAtom,
  setUserAvatarImageToneAtom,
  userAvatarBezelAngleAtom,
  userAvatarImageStatusAtom,
  userAvatarImageToneAtom,
  userAvatarPresenceAtom,
} from "./user-avatar-atom"
import { measureRimTone } from "./utils"

export interface UseUserAvatarOptions {
  avatarId?: UserAvatarInstanceId
  /** Controlled presence. `undefined` leaves the store in charge. */
  presence?: UserPresence
  /** Track the pointer for the bezel highlight. */
  bezel: boolean
  /** Only meaningful with an image — no image, no status to track. */
  hasImage: boolean
  /** The image URL, sampled for its rim lightness once it has loaded so the
   * bezel can pick alphas that read against it. Omit to skip sampling. */
  src?: string
}

export interface UserAvatarBinding {
  avatarId: UserAvatarInstanceId
  presence: UserPresence | null
  bezelAngle: number
  imageStatus: ImageStatus
  /** Rim lightness of the loaded image, 0–1, or `null` while unknown. */
  imageTone: number | null
  /** Hand to the image's `onLoadingStatusChange`. Stable. */
  setImageStatus: (status: ImageStatus) => void
  /** Attach to the avatar root — the bezel is lit relative to its centre. */
  ref: React.RefObject<HTMLElement | null>
}

/** Below this the angle write is skipped: a rim highlight cannot show a
 * sub-degree change, and skipping keeps the pointer loop store-quiet. */
const ANGLE_EPSILON = 1.5

/**
 * Binds one avatar to its slice of the store: projects the controlled
 * `presence` prop, tracks the image status, and — while `bezel` is on —
 * follows the pointer with a rAF-coalesced `pointermove` listener that turns
 * the pointer's bearing from the avatar's centre into `bezelAngle`.
 *
 * Unnamed avatars key off `useId` and are dropped from the store on unmount;
 * a named `avatarId` outlives its component so a presence set elsewhere
 * survives a remount.
 */
export function useUserAvatar(options: UseUserAvatarOptions): UserAvatarBinding {
  const { presence: presenceProp, bezel, hasImage, src } = options
  const generatedId = React.useId()
  const avatarId = options.avatarId ?? generatedId
  const controlsPresence = presenceProp !== undefined

  const config = React.useMemo<UserAvatarConfig>(
    () => ({ controlsPresence }),
    [controlsPresence]
  )

  const project = useSetAtom(projectUserAvatarPropsAtom(avatarId))
  const setBezelAngle = useSetAtom(setUserAvatarBezelAngleAtom(avatarId))
  const setImageStatus = useSetAtom(setUserAvatarImageStatusAtom(avatarId))
  const setImageTone = useSetAtom(setUserAvatarImageToneAtom(avatarId))

  // Layout effect: the projection must land before children read the store
  // in the same commit. Primitive deps, so no loop guard is needed here.
  React.useLayoutEffect(() => {
    project(config, presenceProp)
  }, [project, config, presenceProp])

  // A generated key belongs to this mount only; a given `avatarId` is the
  // app's handle and outlives it.
  React.useEffect(() => {
    if (options.avatarId !== undefined) return
    return () => removeUserAvatarInstance(avatarId)
  }, [options.avatarId, avatarId])

  const presence = useAtomValue(userAvatarPresenceAtom(avatarId))
  const bezelAngle = useAtomValue(userAvatarBezelAngleAtom(avatarId))
  const imageStatus = useAtomValue(userAvatarImageStatusAtom(avatarId))
  const imageTone = useAtomValue(userAvatarImageToneAtom(avatarId))

  const ref = React.useRef<HTMLElement | null>(null)
  const reduce = useReducedMotion()

  // Pointer → bearing. Coalesced to one write per animation frame, and only
  // when the angle moved enough to matter, so a room full of avatars is
  // still one cheap listener each and near-zero store traffic while idle.
  React.useEffect(() => {
    if (!bezel || reduce || typeof window === "undefined") return
    let frame = 0
    let last = Number.NaN
    let pointer: { x: number; y: number } | null = null

    const flush = () => {
      frame = 0
      const host = ref.current
      if (!host || !pointer) return
      const rect = host.getBoundingClientRect()
      if (rect.width === 0) return
      const dx = pointer.x - (rect.left + rect.width / 2)
      const dy = pointer.y - (rect.top + rect.height / 2)
      // atan2 measures from 3 o'clock anticlockwise-positive in screen
      // space; rotate so 0 is 12 o'clock and clockwise grows.
      const bearing = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360
      // Unwrap: step from the last value by the shortest arc, so the stored
      // angle is continuous and the rim never spins the long way round.
      let angle = bearing
      if (!Number.isNaN(last)) {
        let delta = bearing - (((last % 360) + 360) % 360)
        if (delta > 180) delta -= 360
        if (delta < -180) delta += 360
        if (Math.abs(delta) < ANGLE_EPSILON) return
        angle = last + delta
      }
      last = angle
      setBezelAngle(angle)
    }
    const onMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY }
      if (frame === 0) frame = window.requestAnimationFrame(flush)
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    return () => {
      window.removeEventListener("pointermove", onMove)
      if (frame !== 0) window.cancelAnimationFrame(frame)
    }
  }, [bezel, reduce, setBezelAngle])

  // No image, no status: keep the store honest when `src` goes away.
  React.useEffect(() => {
    if (!hasImage) setImageStatus("idle")
  }, [hasImage, setImageStatus])

  // Once the image is on screen, read how light its rim is so the bezel's
  // highlight and shadow can be weighted against it. Cleared whenever the
  // image changes or goes away — a stale tone from the previous photo would
  // light the new one wrong for a frame. Sampling is async (a second, CORS
  // clean decode of the same URL, memoised per src); the cancelled flag
  // keeps a slow sample from landing on a later src.
  React.useEffect(() => {
    setImageTone(null)
    if (!bezel || !hasImage || !src || imageStatus !== "loaded") return
    let cancelled = false
    void measureRimTone(src).then((tone) => {
      if (!cancelled) setImageTone(tone)
    })
    return () => {
      cancelled = true
    }
  }, [bezel, hasImage, src, imageStatus, setImageTone])

  return {
    avatarId,
    presence,
    bezelAngle,
    imageStatus,
    imageTone,
    setImageStatus,
    ref,
  }
}
