"use client"

import * as React from "react"
import { useAtomValue, useSetAtom } from "jotai"

import {
  profileCardBusyAtom,
  profileCardMenuOpenAtom,
  profileCardVariantAtom,
  projectProfileCardPropsAtom,
  removeProfileCardInstance,
  seedProfileCardVariantAtom,
  selectProfileCardActionAtom,
  setProfileCardHandlersAtom,
  setProfileCardMenuOpenAtom,
} from "./profile-card-atom"
import type {
  ProfileCardAction,
  ProfileCardConfig,
  ProfileCardHandlers,
  ProfileCardInstanceId,
  ProfileCardVariant,
} from "./type"

export interface UseProfileCardOptions {
  profileCardId?: ProfileCardInstanceId
  /** Controlled fold. `undefined` leaves the store (and `defaultVariant`) in charge. */
  variant?: ProfileCardVariant
  defaultVariant?: ProfileCardVariant
  onVariantChange?: (variant: ProfileCardVariant) => void
  /** Controlled menu. */
  open?: boolean
  defaultOpen?: boolean
  onError?: (error: unknown) => void
}

export interface ProfileCardBinding {
  profileCardId: ProfileCardInstanceId
  variant: ProfileCardVariant
  collapsed: boolean
  menuOpen: boolean
  busy: boolean
  /** Hand to the menu's `onOpenChange` (first argument). Stable. */
  setMenuOpen: (open: boolean) => void
  /** Run an action: `onSelect`, promise → busy, rejection → `onError`. Stable. */
  select: (action: ProfileCardAction) => void
}

/**
 * Binds one profile card to its slice of the store: projects the controlled
 * `variant` / `open` props (one-way, with write gates so the store never
 * overwrites a prop), publishes the latest handlers, and returns the values
 * the component renders from.
 *
 * Unnamed cards key off `useId` and are dropped on unmount; a named
 * `profileCardId` outlives its component, so a fold set from elsewhere
 * (`useProfileCardActions(id).collapse()`) survives a route change.
 */
export function useProfileCard(options: UseProfileCardOptions): ProfileCardBinding {
  const {
    variant: variantProp,
    defaultVariant = "expanded",
    onVariantChange,
    open: openProp,
    onError,
  } = options
  const generatedId = React.useId()
  const profileCardId = options.profileCardId ?? generatedId

  const controlsVariant = variantProp !== undefined
  const controlsMenuOpen = openProp !== undefined
  const config = React.useMemo<ProfileCardConfig>(
    () => ({ controlsVariant, controlsMenuOpen }),
    [controlsVariant, controlsMenuOpen]
  )
  const handlers = React.useMemo<ProfileCardHandlers>(
    () => ({ onVariantChange, onError }),
    [onVariantChange, onError]
  )

  const project = useSetAtom(projectProfileCardPropsAtom(profileCardId))
  const publishHandlers = useSetAtom(setProfileCardHandlersAtom(profileCardId))
  const seedVariant = useSetAtom(seedProfileCardVariantAtom(profileCardId))
  const setMenuOpen = useSetAtom(setProfileCardMenuOpenAtom(profileCardId))
  const select = useSetAtom(selectProfileCardActionAtom(profileCardId))

  // Seed the uncontrolled fold once per mount, before the projection — the
  // `default*` options describe the mount, not every render. Layout effects
  // so children read settled values in the same commit; primitive deps, so
  // no loop guard is needed.
  const [seed] = React.useState(() => ({
    variant: variantProp ?? defaultVariant,
    open: openProp ?? options.defaultOpen ?? false,
  }))
  React.useLayoutEffect(() => {
    if (!controlsVariant) seedVariant(seed.variant)
    if (!controlsMenuOpen) setMenuOpen(seed.open)
    // Mount-time seed only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  React.useLayoutEffect(() => {
    project(config, variantProp, openProp)
  }, [project, config, variantProp, openProp])
  React.useLayoutEffect(() => {
    publishHandlers(handlers)
  }, [publishHandlers, handlers])

  React.useEffect(() => {
    if (options.profileCardId !== undefined) return
    return () => removeProfileCardInstance(profileCardId)
  }, [options.profileCardId, profileCardId])

  const variant = useAtomValue(profileCardVariantAtom(profileCardId))
  const menuOpen = useAtomValue(profileCardMenuOpenAtom(profileCardId))
  const busy = useAtomValue(profileCardBusyAtom(profileCardId))

  return {
    profileCardId,
    variant,
    collapsed: variant === "collapsed",
    menuOpen,
    busy,
    setMenuOpen,
    select,
  }
}
