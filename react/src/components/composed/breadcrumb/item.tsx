"use client"

import type { ReactElement } from "react"
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover"
import { TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { IBreadcrumbItemProps } from "./type"
import { tooltipHandle } from "./utils"

/** Renders custom content, a link, or a trigger for a preconfigured TOC/menu. */
export default function BreadcrumbItem(
  props: IBreadcrumbItemProps
): ReactElement {
  const { label, tooltip, className } = props

  const withTooltip = (trigger: ReactElement) => (
    <TooltipTrigger
      handle={tooltipHandle}
      disabled={tooltip == null || tooltip === false}
      payload={props}

      render={trigger}
    />
  )

  const renderItem = (): ReactElement => {
    switch (props.variant) {
      case "default":
        return withTooltip(
          <Button size={"sm"} disabled variant="ghost">
            {props.children}
          </Button>
        )
      case "link":
        return withTooltip(
          <Button
            render={<a href={props.href} />}
            onClick={props.onClick}
            size="sm"
            variant="ghost"
          >
            {label}
          </Button>
        )
      case "toc": {
        const { Component, id } = props
        return (
          <Popover>
            <PopoverTrigger
              render={withTooltip(
                <Button id={id} size="sm" variant="ghost">
                  {label}
                </Button>
              )}
            />
            <PopoverPopup align="start" aria-label={label}>
              <Component />
            </PopoverPopup>
          </Popover>
        )
      }
      case "menu": {
        const { Component, id, onClick } = props
        return (
          <Component>
            {withTooltip(
              <Button
                id={id}
                onClick={onClick}
                size="sm"
                variant="ghost"
                className="pr-1"
              >
                {label}
              </Button>
            )}
          </Component>
        )
      }
    }
  }

  return (
    <div
      className={cn("gap-1.5 inline-flex items-center select-none", className)}
      data-slot="breadcrumb-item"
    >
      {renderItem()}
    </div>
  )
}
