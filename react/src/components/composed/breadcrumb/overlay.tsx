"use client"

import { useId } from "react"
import { ChevronDownIcon, InfoIcon } from "lucide-react"
import { Menu, MenuPopup, MenuTrigger } from "@/components/ui/menu"
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip"
import type { BreadcrumbItemOverlay } from "./type"

/** Keep navigation and overlay activation as separate, keyboard-accessible controls. */
export default function BreadcrumbOverlay({
  type,
  label,
  content,
  icon,
  disabled,
  open,
  onOpenChange,
  portalProps,
}: BreadcrumbItemOverlay) {
  const descriptionId = useId()
  const trigger = (
    <button
      type="button"
      aria-label={label}
      aria-describedby={type === "tooltip" ? descriptionId : undefined}
      disabled={disabled}
      data-slot="breadcrumb-overlay-trigger"
      className="size-6 inline-flex shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
    >
      <span aria-hidden="true" className="[&_svg]:size-3.5 flex items-center">
        {icon ?? (type === "menu" ? <ChevronDownIcon /> : <InfoIcon />)}
      </span>
    </button>
  )

  if (type === "menu") {
    return (
      <Menu open={open} onOpenChange={onOpenChange}>
        <MenuTrigger render={trigger} disabled={disabled} />
        <MenuPopup portalProps={portalProps} align="start" aria-label={label}>
          {content}
        </MenuPopup>
      </Menu>
    )
  }
  if (type === "popover") {
    return (
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger render={trigger} disabled={disabled} />
        <PopoverPopup
          portalProps={portalProps}
          align="start"
          aria-label={label}
        >
          {content}
        </PopoverPopup>
      </Popover>
    )
  }
  return (
    <Tooltip open={open} onOpenChange={onOpenChange}>
      <TooltipTrigger render={trigger} disabled={disabled} />
      <TooltipPopup portalProps={portalProps} id={descriptionId} role="tooltip">
        {content}
      </TooltipPopup>
    </Tooltip>
  )
}
