"use client"

import * as React from "react"
import { useAtomValue, useSetAtom } from "jotai"

import type {
  UserAvatarActions,
  UserAvatarInstanceId,
  UserAvatarState,
} from "./type"
import {
  resetUserAvatarAtom,
  setUserAvatarBezelAngleAtom,
  setUserAvatarPresenceAtom,
  toggleUserAvatarPresenceAtom,
  userAvatarStateAtom,
} from "./user-avatar-atom"

/**
 * Read the avatar registered under `avatarId` from anywhere below
 * `ExegiaProvider` — no props, no ref, no provider of its own.
 *
 * ```tsx
 * const { presence } = useUserAvatarState("me")
 * ```
 *
 * Returns the whole state object, so the caller re-renders on any change —
 * including every bezel frame while a pointer moves. A component that only
 * cares about presence should subscribe to that atom instead:
 * `useAtomValue(userAvatarPresenceAtom("me"))`.
 */
export function useUserAvatarState(
  avatarId: UserAvatarInstanceId
): UserAvatarState {
  return useAtomValue(userAvatarStateAtom(avatarId))
}

/**
 * Write-only handles onto the avatar registered under `avatarId`. Nothing
 * here subscribes, so a presence indicator elsewhere in the app can flip
 * the badge without re-rendering when the avatar changes.
 *
 * ```tsx
 * const { setPresence } = useUserAvatarActions("me")
 * socket.on("presence", (p) => setPresence(p))
 * ```
 */
export function useUserAvatarActions(
  avatarId: UserAvatarInstanceId
): UserAvatarActions {
  const setPresence = useSetAtom(setUserAvatarPresenceAtom(avatarId))
  const togglePresence = useSetAtom(toggleUserAvatarPresenceAtom(avatarId))
  const setBezelAngle = useSetAtom(setUserAvatarBezelAngleAtom(avatarId))
  const reset = useSetAtom(resetUserAvatarAtom(avatarId))

  return React.useMemo(
    () => ({ setPresence, togglePresence, setBezelAngle, reset }),
    [setPresence, togglePresence, setBezelAngle, reset]
  )
}
