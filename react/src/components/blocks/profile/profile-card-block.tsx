"use client"

import {
  ChevronsUpDownIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import * as React from "react"

import {
  AnimatedSidebarPanelContext,
  LABEL_ENTER_TRANSITION,
  LABEL_EXIT_TRANSITION,
  REDUCED_TRANSITION,
} from "@/components/blocks/shell/utils"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  type MenuPrimitive,
} from "@/components/ui/menu"
import { playCue } from "@/lib/sound"
import { cn } from "@/lib/utils"

import { useProfileCard } from "./use-profile-card"
import type {
  ProfileCardAction,
  ProfileCardItem,
  ProfileCardUser,
  ProfileCardVariant,
} from "./type"

export type {
  ProfileCardAction,
  ProfileCardActions,
  ProfileCardInstanceId,
  ProfileCardItem,
  ProfileCardLabel,
  ProfileCardSeparator,
  ProfileCardState,
  ProfileCardUser,
  ProfileCardVariant,
} from "./type"

/**
 * The menu the card ships with. Spread it to keep the shape and attach your
 * own handlers, or ignore it and pass `items` of your own.
 */
export const defaultProfileCardItems: ProfileCardItem[] = [
  { type: "label", label: "Management" },
  { id: "profile", label: "Profile", icon: <UserIcon aria-hidden="true" /> },
  {
    id: "settings",
    label: "Settings",
    icon: <SettingsIcon aria-hidden="true" />,
  },
  { type: "separator" },
  { id: "teams", label: "Teams", icon: <UsersIcon aria-hidden="true" /> },
  { id: "invite", label: "Invite", icon: <UserPlusIcon aria-hidden="true" /> },
  { type: "separator" },
  {
    id: "sign-out",
    label: "Log out",
    icon: <LogOutIcon aria-hidden="true" />,
    variant: "destructive",
  },
]

type PopupProps = React.ComponentProps<typeof DropdownMenuContent>

export interface ProfileCardBlockProps {
  user: ProfileCardUser
  /**
   * The menu, flat: actions plus `{ type: "separator" }` / `{ type: "label" }`
   * entries. Defaults to `defaultProfileCardItems` (no handlers attached).
   */
  items?: ProfileCardItem[]
  /** Menu placement relative to the card. */
  align?: PopupProps["align"]
  side?: PopupProps["side"]
  sideOffset?: PopupProps["sideOffset"]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: MenuPrimitive.Root.Props["onOpenChange"]
  /**
   * "content" sizes the menu to its items; "card" locks it to the trigger's
   * width, so `align` stops mattering horizontally.
   */
  menuWidth?: "content" | "card"
  /**
   * `expanded` shows avatar, name and handle; `collapsed` folds the card to
   * its avatar — for an icon-collapsed sidebar rail. The fold animates: the
   * identity lines and chevron slide to zero width, the avatar stays put.
   * Controlled when passed. Left unset, the card follows the `AnimatedPanel`
   * it sits in (a panel footer folds with the rail on its own), and
   * outside a panel starts from `defaultVariant`.
   */
  variant?: ProfileCardVariant
  defaultVariant?: ProfileCardVariant
  onVariantChange?: (variant: ProfileCardVariant) => void
  /**
   * Name this card's slice of the store so `useProfileCardState(id)` /
   * `useProfileCardActions(id)` can read or drive it (fold it, open its
   * menu) from anywhere under `ExegiaProvider`. Unnamed cards key off
   * `useId` and are dropped on unmount.
   */
  profileCardId?: string
  /**
   * Presence badge on the avatar — overrides `user.presence`. Name the avatar
   * with `avatarId` and `useUserAvatarActions(id).setPresence()` can flip it
   * from a socket handler instead.
   */
  presence?: ProfileCardUser["presence"]
  avatarId?: string
  /**
   * Emit cuelume press/release on the card and play the open/close cues.
   * Inert unless the app opts into interaction sound via `bindSounds()`.
   */
  sound?: boolean
  /** Called when an action's promise rejects — the card leaves its loading state either way. */
  onError?: (error: unknown) => void
  className?: string
}

/** Split a flat item list into the groups the menu renders. */
function toGroups(
  items: ProfileCardItem[]
): { label?: string; actions: ProfileCardAction[] }[] {
  const groups: { label?: string; actions: ProfileCardAction[] }[] = []
  let current: { label?: string; actions: ProfileCardAction[] } = {
    actions: [],
  }

  for (const item of items) {
    if (item.type === "separator") {
      groups.push(current)
      current = { actions: [] }
    } else if (item.type === "label") {
      current.label = item.label
    } else {
      current.actions.push(item)
    }
  }
  groups.push(current)

  return groups.filter(
    (group) => group.actions.length > 0 || group.label !== undefined
  )
}

/**
 * Avatar card that opens an account menu.
 *
 * The trigger is the rich identity chip (avatar + name over handle) and the
 * popup is a plain action menu. `items` is the whole menu — a flat list of
 * actions, separators and labels — defaulting to `defaultProfileCardItems`.
 */
export function ProfileCardBlock({
  user,
  items = defaultProfileCardItems,
  align = "center",
  side = "bottom",
  sideOffset = 8,
  menuWidth = "content",
  variant: variantProp,
  defaultVariant,
  onVariantChange,
  profileCardId,
  presence,
  avatarId,
  open,
  defaultOpen,
  onOpenChange,
  sound = true,
  onError,
  className,
}: ProfileCardBlockProps): React.ReactElement {
  const groups = React.useMemo(() => toGroups(items), [items])

  // Optional, not required: the card is a standalone block that also lands
  // in sidebar footers, so it reads the panel context when there is one and
  // does not throw when there is not. Inside a panel the rail is the truth
  // for the fold, so it is projected as a controlled variant.
  const panel = React.useContext(AnimatedSidebarPanelContext)
  const card = useProfileCard({
    profileCardId,
    variant:
      variantProp ??
      (panel ? (panel.collapsed ? "collapsed" : "expanded") : undefined),
    defaultVariant,
    onVariantChange,
    open,
    defaultOpen,
    onError,
  })
  const { collapsed, busy, menuOpen, setMenuOpen, select } = card
  const reduce = useReducedMotion()
  const identity = `${user.name}${user.username ? ` ${user.username}` : ""}`

  const handleOpenChange: MenuPrimitive.Root.Props["onOpenChange"] = (
    nextOpen,
    details
  ) => {
    if (sound) playCue(nextOpen ? "bloom" : "droplet")
    setMenuOpen(nextOpen)
    onOpenChange?.(nextOpen, details)
  }

  return (
    // The store mirrors the menu: `open` (when passed) is projected into it,
    // and this always renders from it, so `useProfileCardActions(id).openMenu()`
    // works the same whether or not the consumer controls the prop.
    <DropdownMenu onOpenChange={handleOpenChange} open={menuOpen}>
      <DropdownMenuTrigger
        disabled={busy}
        render={
          <Button
            // Spelled out rather than left to the name-from-contents rule: the
            // avatar sits inside the button and the handle is a second line.
            aria-label={`${identity}, account menu`}
            className={cn(
              // Quiet at rest — the background only surfaces on hover or
              // while the menu is open.
              "h-auto w-full justify-between py-1.5 pl-1.5 data-popup-open:bg-accent sm:h-auto",
              // Folded: a full-width h-10 row matching the tree rail's tiles,
              // avatar centred — a fixed-width tile drifted off the rail's
              // centre line whenever the collapsed panel was wider than it.
              // The label spans below fold to zero width rather than
              // unmounting so the change animates. Button's own gap-2 stays:
              // its always-mounted loading slot carries a -ms-2 that cancels
              // it, so zeroing the gap would pull the avatar 8px left; the
              // folded chevron cancels its own gap instead (see below).
              // `sm:h-10` because the base carries an `sm:h-auto` that an
              // unprefixed height would not beat.
              collapsed &&
                "h-10 w-full shrink-0 justify-center rounded-xl p-0 sm:h-10",
              className
            )}
            data-collapsed={collapsed ? "" : undefined}
            data-slot="profile-card"
            data-variant={collapsed ? "collapsed" : "expanded"}
            loading={busy}
            sound={sound}
            // The visible name is gone while folded — name the tile on hover
            // the way the rail's menu buttons do.
            title={collapsed ? identity : undefined}
            variant="ghost"
          >
            <span
              className={cn(
                "flex min-w-0 items-center justify-start",
                collapsed ? "w-auto gap-0" : "w-full gap-2"
              )}
            >
              <UserAvatar
                // Decorative: the name beside it already labels the card.
                alt=""
                avatarId={avatarId}
                initials={user.initials}
                name={user.name}
                presence={presence ?? user.presence}
                src={user.avatar}
              />
              <motion.span
                animate={{
                  width: collapsed ? 0 : "auto",
                  opacity: collapsed ? 0 : 1,
                  x: collapsed ? -4 : 0,
                }}
                aria-hidden={collapsed || undefined}
                className={cn(
                  "flex min-w-0 flex-col overflow-hidden text-left whitespace-nowrap",
                  collapsed && "pointer-events-none"
                )}
                data-slot="profile-card-identity"
                initial={false}
                transition={
                  reduce
                    ? REDUCED_TRANSITION
                    : collapsed
                      ? LABEL_EXIT_TRANSITION
                      : LABEL_ENTER_TRANSITION
                }
              >
                <span className="truncate font-medium">{user.name}</span>
                {user.username ? (
                  <span className="truncate text-xs font-normal text-muted-foreground">
                    {user.username}
                  </span>
                ) : null}
              </motion.span>
            </span>
            <motion.span
              animate={{
                width: collapsed ? 0 : "auto",
                opacity: collapsed ? 0 : 1,
                x: collapsed ? 4 : 0,
              }}
              aria-hidden="true"
              className={cn(
                "flex shrink-0 items-center overflow-hidden",
                // 0px wide while folded, but the flex gap before it would
                // still offset the avatar — pull it back by that gap.
                collapsed && "-ml-2"
              )}
              initial={false}
              transition={
                reduce
                  ? REDUCED_TRANSITION
                  : collapsed
                    ? LABEL_EXIT_TRANSITION
                    : LABEL_ENTER_TRANSITION
              }
            >
              <ChevronsUpDownIcon aria-hidden="true" className="size-3.5" />
            </motion.span>
          </Button>
        }
      />
      <DropdownMenuContent
        align={align}
        // Content-width by default so `align` reads: a popup locked to
        // `--anchor-width` lands in the same place for every value. `!`
        // because the popup's own `not-[class*='w-']:min-w-32` compiles to
        // a higher-specificity `:not(:is())` that would otherwise win.
        className={cn(
          menuWidth === "card" ? "w-(--anchor-width)" : "min-w-44!",
          "origin-(--transform-origin) transition-[opacity,scale,translate] duration-150 ease-smooth-out data-ending-style:scale-98 data-ending-style:opacity-0 data-ending-style:duration-100 data-starting-style:scale-98 data-starting-style:opacity-0 data-[side=bottom]:data-ending-style:-translate-y-1 data-[side=bottom]:data-starting-style:-translate-y-1 data-[side=top]:data-ending-style:translate-y-1 data-[side=top]:data-starting-style:translate-y-1 motion-reduce:transition-none"
        )}
        side={side}
        sideOffset={sideOffset}
      >
        {groups.map((group, index) => (
          <React.Fragment key={group.label ?? `group-${group.actions[0]?.id}`}>
            {index > 0 ? <DropdownMenuSeparator /> : null}
            <DropdownMenuGroup>
              {group.label ? (
                <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
              ) : null}
              {group.actions.map((item) => (
                <DropdownMenuItem
                  disabled={item.disabled}
                  key={item.id}
                  onClick={() => select(item)}
                  variant={item.variant}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.shortcut ? (
                    <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
                  ) : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
