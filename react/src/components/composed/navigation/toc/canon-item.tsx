"use client"

import type { JSX } from "react"
import { ToggleGroup as ArkToggleGroup } from "@ark-ui/react/toggle-group"
import { motion, useReducedMotion } from "motion/react"
import { TooltipCreateHandle, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuPopup,
  ContextMenuItem,
} from "@/components/ui/context-menu"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CanonItemProps } from "./type"

type BookTooltipHandle = ReturnType<typeof TooltipCreateHandle<string>>

export function CanonItem({
  size = "default",
  item,
  active,
  onLinkClick,
  tooltipHandle,
  contextMenuItems,
}: CanonItemProps & { tooltipHandle?: BookTooltipHandle }): JSX.Element {
  const reducedMotion = useReducedMotion()
  const content = (
    <>
      {active && (
        <motion.span
          aria-hidden="true"
          layoutId="canon-selection"
          initial={false}
          transition={{
            type: "spring",
            duration: reducedMotion ? 0 : 0.3,
            bounce: 0,
          }}
          className="inset-0 bg-stone-950 dark:bg-stone-100 pointer-events-none absolute rounded-sm bezel-dim-b-2 bezel-dim-blur-3 bezel-dim/78 bezel-lit-blur-2 bezel-lit-t-3 bezel-lit/14 dark:bezel-dim/50 dark:bezel-lit-blur-2 dark:bezel-lit/90"
        />
      )}
      <span
        className={cn(
          "relative z-10",
          item.type === "book"
            ? "text-xs"
            : size === "sm"
              ? "text-sm font-semibold"
              : "text-lg font-semibold"
        )}
      >
        {item.type === "book" ? item.abbreviation : (item.number ?? item.label)}
      </span>
    </>
  )
  const tile = (
    <ArkToggleGroup.Item
      value={item.link}
      data-slot="toggle-group-item"
      onClick={() => onLinkClick?.(item)}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "min-w-0 p-0 min-h-12 bg-stone-100 dark:bg-stone-900 relative isolate aspect-square h-auto w-full rounded-sm",
        size === "sm" && "min-h-8",
        active && "text-white! dark:text-black! hover:bg-transparent!",
        "bezel-dim-b-2 bezel-dim-blur-1 bezel-dim/10 bezel-lit-blur-1 bezel-lit-t-2 bezel-lit/90 dark:bezel-lit-blur-2 dark:bezel-lit-t-1 dark:bezel-lit/20 dark:bezel-dim"
      )}
    />
  )
  const trigger = tooltipHandle ? (
    <TooltipTrigger
      delay={300}
      handle={tooltipHandle}
      payload={item.label}

      render={tile}
    >
      {content}
    </TooltipTrigger>
  ) : (
    <ArkToggleGroup.Item {...tile.props}>{content}</ArkToggleGroup.Item>
  )
  const menuItems =
    typeof contextMenuItems === "function"
      ? contextMenuItems(item)
      : contextMenuItems
  if (!menuItems?.length) return trigger
  return (
    <ContextMenu>
      <ContextMenuTrigger render={trigger} />
      <ContextMenuPopup>
        {menuItems.map((action) => (
          <ContextMenuItem
            key={action.id}
            disabled={action.disabled}
            variant={action.variant}
            onClick={() => action.onSelect(item)}
          >
            {action.icon}
            {action.label}
          </ContextMenuItem>
        ))}
      </ContextMenuPopup>
    </ContextMenu>
  )
}
