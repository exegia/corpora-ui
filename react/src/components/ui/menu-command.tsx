"use client"

import type * as React from "react"
import {
  Menu,
  MenuGroup,
  MenuItem,
  MenuLinkItem,
  MenuPopup,
  MenuTrigger,
} from "@/components/ui/menu"
import { cn } from "@/lib/utils"

export interface MenuCommandItem {
  id: string
  label: React.ReactNode
  /** Muted copy after the label ("Upload from your computer"). */
  description?: React.ReactNode
  icon?: React.ReactNode
  /** Right-aligned status ("Connected"). */
  trailing?: React.ReactNode
  /** Renders the row as a link instead of a button. */
  href?: string
  disabled?: boolean
  onSelect?: () => void
}

export interface MenuCommandListProps {
  items: MenuCommandItem[]
  onSelect?: (item: MenuCommandItem) => void
  className?: string
}

/**
 * Command rows for a menu popup: icon · label · description · trailing
 * status. Use inside any `MenuPopup`, or via `MenuCommand` for the wired
 * trigger + popup pair.
 *
 * @sketch "Atom / Menu Command"
 */
export function MenuCommandList({
  items,
  onSelect,
  className,
}: MenuCommandListProps): React.ReactElement {
  return (
    <MenuGroup className={cn("flex flex-col", className)} data-slot="menu-command-list">
      {items.map((item) => {
        const body = (
          <>
            {item.icon ? (
              <span className="flex size-4 shrink-0 items-center justify-center text-text-secondary [&>svg]:size-4">
                {item.icon}
              </span>
            ) : null}
            <span className="shrink-0 font-medium text-text-primary">{item.label}</span>
            {item.description ? (
              <span className="truncate text-text-secondary">{item.description}</span>
            ) : null}
            {item.trailing ? (
              <span className="ml-auto shrink-0 pl-3 text-semantic-success">{item.trailing}</span>
            ) : null}
          </>
        )
        const rowClass = "h-9 gap-2.5 rounded-md px-2 text-[13px]"
        const select = () => {
          item.onSelect?.()
          onSelect?.(item)
        }
        return item.href ? (
          <MenuLinkItem
            aria-disabled={item.disabled || undefined}
            className={cn(rowClass, item.disabled && "pointer-events-none opacity-64")}
            data-command={item.id}
            href={item.href}
            key={item.id}
            onClick={select}
          >
            {body}
          </MenuLinkItem>
        ) : (
          <MenuItem
            className={rowClass}
            data-command={item.id}
            disabled={item.disabled}
            key={item.id}
            onClick={select}
          >
            {body}
          </MenuItem>
        )
      })}
    </MenuGroup>
  )
}

export interface MenuCommandProps extends MenuCommandListProps {
  /** The trigger element; receives the menu's trigger props. */
  children: React.ReactElement
  side?: React.ComponentProps<typeof MenuPopup>["side"]
  align?: React.ComponentProps<typeof MenuPopup>["align"]
  popupClassName?: string
}

/** A trigger and a popup of command rows, wired together. */
export function MenuCommand({
  children,
  items,
  onSelect,
  side = "top",
  align = "start",
  className,
  popupClassName,
}: MenuCommandProps): React.ReactElement {
  return (
    <Menu>
      <MenuTrigger render={children} />
      <MenuPopup
        align={align}
        className={cn("w-[28rem] max-w-[calc(100vw-2rem)]", popupClassName)}
        side={side}
        sideOffset={8}
      >
        <MenuCommandList className={className} items={items} onSelect={onSelect} />
      </MenuPopup>
    </Menu>
  )
}
