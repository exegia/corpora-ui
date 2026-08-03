"use client";

import {
  ChevronsUpDownIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/menu";
import { playCue } from "@/lib/sound";
import { cn } from "@/lib/utils";

/** The identity shown on the card. */
export interface ProfileCardUser {
  name: string;
  /** Secondary line under the name — a handle, an email, a role. */
  username?: string;
  /** Avatar image URL. Falls back to the initials when absent or broken. */
  avatar?: string;
  /** Fallback initials. Derived from `name` when omitted. */
  initials?: string;
}

/** One row of the menu. */
export interface ProfileCardAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  /** Right-aligned hint, e.g. "⌘K". Purely decorative — bind the key yourself. */
  shortcut?: string;
  disabled?: boolean;
  variant?: "default" | "destructive";
  /** Returning a promise puts the trigger in its loading state until it settles. */
  onSelect?: () => void | Promise<void>;
}

/** A labelled section of the menu; sections are separated automatically. */
export interface ProfileCardGroup {
  label?: string;
  items: ProfileCardAction[];
}

type PopupProps = React.ComponentProps<typeof DropdownMenuContent>;

export interface ProfileCardBlockProps {
  user: ProfileCardUser;
  /** Replaces the default menu entirely. The `on*` handlers are then unused. */
  groups?: ProfileCardGroup[];
  onProfile?: () => void | Promise<void>;
  onSettings?: () => void | Promise<void>;
  onTeams?: () => void | Promise<void>;
  onInvite?: () => void | Promise<void>;
  onSignOut?: () => void | Promise<void>;
  /** Menu placement relative to the card. */
  align?: PopupProps["align"];
  side?: PopupProps["side"];
  sideOffset?: PopupProps["sideOffset"];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: MenuPrimitive.Root.Props["onOpenChange"];
  /**
   * Emit cuelume press/release on the card and play the open/close cues.
   * Inert unless the app opts into interaction sound via `bindSounds()`.
   */
  sound?: boolean;
  /** Called when an action's promise rejects — the card leaves its loading state either way. */
  onError?: (error: unknown) => void;
  className?: string;
}

/** "Jenny Hamilton" → "JH", "luna" → "L". */
function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/**
 * Avatar card that opens an account menu.
 *
 * The trigger is the rich identity chip (avatar + name over handle) and the
 * popup is a plain action menu — profile/settings, teams/invite and a
 * destructive sign-out. Pass `groups` to replace the menu wholesale; the named
 * handlers only drive the default set.
 */
export function ProfileCardBlock({
  user,
  groups,
  onProfile,
  onSettings,
  onTeams,
  onInvite,
  onSignOut,
  align = "center",
  side = "bottom",
  sideOffset = 8,
  open,
  defaultOpen,
  onOpenChange,
  sound = true,
  onError,
  className,
}: ProfileCardBlockProps): React.ReactElement {
  const [pending, setPending] = React.useState<string | null>(null);
  // Actions can outlive the card (sign-out unmounts it, typically).
  const mounted = React.useRef(true);
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const resolvedGroups: ProfileCardGroup[] = groups ?? [
    {
      label: "Management",
      items: [
        {
          id: "profile",
          label: "Profile",
          icon: <UserIcon aria-hidden="true" />,
          onSelect: onProfile,
        },
        {
          id: "settings",
          label: "Settings",
          icon: <SettingsIcon aria-hidden="true" />,
          onSelect: onSettings,
        },
      ],
    },
    {
      items: [
        {
          id: "teams",
          label: "Teams",
          icon: <UsersIcon aria-hidden="true" />,
          onSelect: onTeams,
        },
        {
          id: "invite",
          label: "Invite",
          icon: <UserPlusIcon aria-hidden="true" />,
          onSelect: onInvite,
        },
      ],
    },
    {
      items: [
        {
          id: "sign-out",
          label: "Log out",
          icon: <LogOutIcon aria-hidden="true" />,
          variant: "destructive",
          onSelect: onSignOut,
        },
      ],
    },
  ];

  function select(action: ProfileCardAction) {
    const result = action.onSelect?.();
    if (!(result instanceof Promise)) return;
    setPending(action.id);
    result
      .catch((cause: unknown) => onError?.(cause))
      .finally(() => {
        if (mounted.current) setPending(null);
      });
  }

  const busy = pending !== null;
  const initials = user.initials ?? initialsFrom(user.name);

  const handleOpenChange: MenuPrimitive.Root.Props["onOpenChange"] = (
    nextOpen,
    details,
  ) => {
    if (sound) playCue(nextOpen ? "bloom" : "droplet");
    onOpenChange?.(nextOpen, details);
  };

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
              "h-auto w-full justify-between py-1.5 pl-1.5 sm:h-auto",
              className,
            )}
            data-slot="profile-card"
            loading={busy}
            sound={sound}
            variant="outline"
          >
            <span className="flex min-w-0 items-center gap-2">
              <Avatar className="size-8">
                {user.avatar ? (
                  // Decorative: the name beside it already labels the card.
                  <AvatarImage alt="" src={user.avatar} />
                ) : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="flex min-w-0 flex-col text-left">
                <span className="truncate font-medium">{user.name}</span>
                {user.username ? (
                  <span className="truncate font-normal text-muted-foreground text-xs">
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
        // `!` because the popup's own `not-[class*='w-']:min-w-32` compiles to
        // a higher-specificity `:not(:is())` that would otherwise win.
        className="min-w-(--anchor-width)!"
        side={side}
        sideOffset={sideOffset}
      >
        {resolvedGroups.map((group, index) => (
          <React.Fragment key={group.label ?? `group-${group.items[0]?.id}`}>
            {index > 0 ? <DropdownMenuSeparator /> : null}
            <DropdownMenuGroup>
              {group.label ? (
                <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
              ) : null}
              {group.items.map((item) => (
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
  );
}
