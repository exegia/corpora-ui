"use client"

import { ChevronRight } from "lucide-react"
import type { ReactElement } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/ui/button"
import type { IBreadcrumbSeparatorProps } from "./types"

/** Displays a decorative symbol or uses it as a labelled menu trigger. */
export default function BreadcrumbSeparator({
  children,
  className,
  symbol = "chevron",
  variant,
  Component,
  label,
  disabled,
  ...props
}: IBreadcrumbSeparatorProps): ReactElement {
  const content = children ?? (symbol === "slash" ? "/" : <ChevronRight />)

  return (
    <li
      {...props}
      aria-hidden={variant === "menu" ? undefined : true}
      className={cn("[&>svg]:size-4 opacity-80", className)}
      data-slot="breadcrumb-separator"
      role="presentation"
    >
      {variant === "menu" ? (
        <Component>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={label}
            disabled={disabled}
          >
            <span aria-hidden="true" className="[&>svg]:size-4 inline-flex">
              {content}
            </span>
          </Button>
        </Component>
      ) : (
        content
      )}
    </li>
  )
}
