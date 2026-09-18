"use client"

import * as React from "react"
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandPanel,
  CommandEmpty,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

export interface IMenuCommandItem {
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

export interface IMenuCommandListProps {
  items: IMenuCommandItem[]
  onSelect?: (item: IMenuCommandItem) => void
  className?: string
}

/**
 * Searchable command rows: icon · label · description · trailing status.
 * Uses the shared Command components; MenuCommand adds a popover trigger.
 *
 * @sketch "Atom / Menu Command"
 */
export function MenuCommandList({
  items,
  onSelect,
  className,
}: IMenuCommandListProps): React.ReactElement {
  return (
    <Command
      items={items}
      itemToStringValue={(value) => {
        const item = value as IMenuCommandItem
        return typeof item.label === "string" ? item.label : item.id
      }}
    >
      <CommandPanel className={className} data-slot="menu-command-list">
        <CommandInput
          aria-label="Search commands"
          placeholder="Search commands…"
        />
        <CommandEmpty>No commands found.</CommandEmpty>
        <CommandList>
          {(item: IMenuCommandItem) => {
            const body = (
              <>
                {item.icon ? (
                  <span className="size-4 [&>svg]:size-4 flex shrink-0 items-center justify-center text-text-secondary">
                    {item.icon}
                  </span>
                ) : null}
                <span className="font-medium shrink-0 text-text-primary">
                  {item.label}
                </span>
                {item.description ? (
                  <span className="truncate text-text-secondary">
                    {item.description}
                  </span>
                ) : null}
                {item.trailing ? (
                  <span className="pl-3 ml-auto shrink-0 text-semantic-success">
                    {item.trailing}
                  </span>
                ) : null}
              </>
            )
            const rowClass = "h-9 gap-2.5 rounded-md px-2 text-[13px]"
            const select = () => {
              item.onSelect?.()
              onSelect?.(item)
            }
            return (
              <CommandItem
                key={item.id}
                value={item}
                className={rowClass}
                data-command={item.id}
                disabled={item.disabled}
                render={
                  item.href && !item.disabled ? (
                    <a href={item.href} />
                  ) : undefined
                }
                onClick={() => {
                  if (!item.disabled) select()
                }}
              >
                {body}
              </CommandItem>
            )
          }}
        </CommandList>
      </CommandPanel>
    </Command>
  )
}

export interface IMenuCommandProps extends IMenuCommandListProps {
  /** The trigger element; receives the menu's trigger props. */
  children: React.ReactElement
  side?: React.ComponentProps<typeof PopoverPopup>["side"]
  align?: React.ComponentProps<typeof PopoverPopup>["align"]
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
}: IMenuCommandProps): React.ReactElement {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={children} />
      <PopoverPopup
        align={align}
        className={cn("w-[28rem] max-w-[calc(100vw-2rem)]", popupClassName)}
        side={side}
        sideOffset={8}
      >
        <MenuCommandList
          className={className}
          items={items}
          onSelect={(item) => {
            setOpen(false)
            onSelect?.(item)
          }}
        />
      </PopoverPopup>
    </Popover>
  )
}
