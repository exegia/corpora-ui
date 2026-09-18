import type * as React from "react"

import type { TAvatarStatus } from "@/components/atoms"

/** The identity shown on the card. */
export interface IProfileCardUser {
  name: string
  /** Secondary line under the name — a handle, an email, a role. */
  username?: string
  /** Avatar image URL. Falls back to the initials when absent or broken. */
  avatar?: string
  /** Fallback initials. Derived from `name` when omitted. */
  initials?: string
  /** Presence badge on the avatar. Omitted, no badge. */
  presence?: TAvatarStatus
}

/** An actionable row of the menu. */
export interface IProfileCardAction {
  type?: "item"
  id: string
  label: string
  icon?: React.ReactNode
  /** Right-aligned hint, e.g. "⌘K". Purely decorative — bind the key yourself. */
  shortcut?: string
  disabled?: boolean
  variant?: "default" | "destructive"
  /** Returning a promise puts the card in its loading state until it settles. */
  onSelect?: () => void | Promise<void>
}

/** A heading over the rows that follow it, up to the next separator. */
export interface IProfileCardLabel {
  type: "label"
  label: string
}

/** A rule between two sections. */
export interface IProfileCardSeparator {
  type: "separator"
}

/**
 * One entry of `items`. Authored flat; the block renders each run between
 * separators as its own menu group so a label actually names its section.
 */
export type TProfileCardItem =
  IProfileCardAction | IProfileCardLabel | IProfileCardSeparator

/** `expanded` shows avatar, name and handle; `collapsed` folds to the avatar
 * alone — for an icon-collapsed sidebar rail. */
export type TProfileCardVariant = "expanded" | "collapsed"

/** Key for one card's state in the store. Any stable string; `useProfileCard`
 * generates one when the component does not name itself. */
export type TProfileCardInstanceId = string

/** Everything the store knows about one card. */
export interface IProfileCardState {
  variant: TProfileCardVariant
  menuOpen: boolean
  /** Id of the action whose promise is in flight, `null` while idle. */
  pendingActionId: string | null
  /** `pendingActionId !== null` — the trigger is disabled and shows a spinner. */
  busy: boolean
}

/** Write-only handles onto one card. Nothing here re-renders the caller. */
export interface IProfileCardActions {
  setVariant: (variant: TProfileCardVariant) => void
  toggleVariant: () => void
  /** Convenience over `setVariant`. */
  collapse: () => void
  expand: () => void
  setMenuOpen: (open: boolean) => void
  openMenu: () => void
  closeMenu: () => void
  reset: () => void
}

/** @internal Which fields the mounted component controls from props. The
 * store must never overwrite a controlled value. */
export interface IProfileCardConfig {
  controlsVariant: boolean
  controlsMenuOpen: boolean
}

/** @internal Latest option callbacks. Only write atoms read this, so it can
 * be refreshed every commit without re-rendering anything. */
export interface IProfileCardHandlers {
  onVariantChange?: (variant: TProfileCardVariant) => void
  onError?: (error: unknown) => void
}
