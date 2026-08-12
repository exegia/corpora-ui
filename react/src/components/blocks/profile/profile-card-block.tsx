"use client"

import {
  ChevronsUpDownIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react"
import * as React from "react"

import { UserAvatar } from "@/components/composed/user-avatar"
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

/** The identity shown on the card. */
export interface ProfileCardUser {
  name: string
  /** Secondary line under the name — a handle, an email, a role. */
  username?: string
  /** Avatar image URL. Falls back to the initials when absent or broken. */
  avatar?: string
  /** Fallback initials. Derived from `name` when omitted. */
  initials?: string
}

/** An actionable row of the menu. */
export interface ProfileCardAction {
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
export interface ProfileCardLabel {
  type: "label"
  label: string
}

/** A rule between two sections. */
export interface ProfileCardSeparator {
  type: "separator"
}

/**
 * One entry of `items`. Authored flat; the block renders each run between
 * separators as its own menu group so a label actually names its section.
 */
export type ProfileCardItem =
  ProfileCardAction | ProfileCardLabel | ProfileCardSeparator

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
  open,
  defaultOpen,
  onOpenChange,
  sound = true,
  onError,
  className,
}: ProfileCardBlockProps): React.ReactElement {
  const [pending, setPending] = React.useState<string | null>(null)
  // Actions can outlive the card (sign-out unmounts it, typically).
  const mounted = React.useRef(true)
  React.useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const groups = React.useMemo(() => toGroups(items), [items])

  function select(action: ProfileCardAction) {
    const result = action.onSelect?.()
    if (!(result instanceof Promise)) return
    setPending(action.id)
    result
      .catch((cause: unknown) => onError?.(cause))
      .finally(() => {
        if (mounted.current) setPending(null)
      })
  }

  const busy = pending !== null

  const handleOpenChange: MenuPrimitive.Root.Props["onOpenChange"] = (
    nextOpen,
    details
  ) => {
    if (sound) playCue(nextOpen ? "bloom" : "droplet")
    onOpenChange?.(nextOpen, details)
  }

  return (
    <DropdownMenu
      defaultOpen={defaultOpen}
      onOpenChange={handleOpenChange}
      open={open}
    >
      <DropdownMenuTrigger
        disabled={busy}
        render={
          <Button
            // Spelled out rather than left to the name-from-contents rule: the
            // avatar sits inside the button and the handle is a second line.
            aria-label={`${user.name}${user.username ? ` ${user.username}` : ""}, account menu`}
            className={cn(
              // Quiet at rest — the background only surfaces on hover or
              // while the menu is open.
              "h-auto w-full justify-between py-1.5 pl-1.5 data-popup-open:bg-accent sm:h-auto",
              className
            )}
            data-slot="profile-card"
            loading={busy}
            sound={sound}
            variant="ghost"
          >
            <span className="flex w-full min-w-0 items-center justify-start gap-2">
              <UserAvatar
                // Decorative: the name beside it already labels the card.
                alt=""
                initials={user.initials}
                name={user.name}
                src={user.avatar}
              />
              <span className="flex min-w-0 flex-col text-left">
                <span className="truncate font-medium">{user.name}</span>
                {user.username ? (
                  <span className="truncate text-xs font-normal text-muted-foreground">
                    {user.username}
                  </span>
                ) : null}
              </span>
            </span>
            <ChevronsUpDownIcon aria-hidden="true" className="size-3.5" />
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
