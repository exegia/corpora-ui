"use client"

import { ArrowUpRight } from "lucide-react"
import type * as React from "react"
import { cn } from "@/lib/utils"

export interface ReferenceChipProps extends React.ComponentPropsWithoutRef<"a"> {
  /** Without an href the chip renders as a button (or a plain span if it has no onClick). */
  href?: string
  onClick?: React.MouseEventHandler<HTMLElement>
  /** Hide the trailing arrow, e.g. for a non-navigating tag. */
  showArrow?: boolean
}

/**
 * "Reference 1 ↗" — a translucent tag pointing at the node, passage or
 * source a suggestion is grounded in. Follows the card it sits in.
 */
export function ReferenceChip({
  href,
  onClick,
  showArrow = true,
  className,
  children,
  ...props
}: ReferenceChipProps): React.ReactElement {
  const classes = cn(
    "group/reference inline-flex h-7 max-w-full shrink-0 items-center gap-1 rounded-2xl bg-black/6 px-2.5 text-sm leading-none font-medium text-foreground/90 outline-none transition-[background-color,scale] duration-150 ease-smooth-out dark:bg-black/15 dark:text-neutral-100",
    (href || onClick) &&
      "cursor-pointer hover:bg-black/10 active:scale-97 focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-black/25 motion-reduce:active:scale-100",
    className
  )
  const content = (
    <>
      <span className="truncate">{children}</span>
      {showArrow ? (
        <ArrowUpRight
          aria-hidden="true"
          className="size-3.5 shrink-0 opacity-60 transition-transform duration-150 ease-smooth-out group-hover/reference:translate-x-px group-hover/reference:-translate-y-px"
        />
      ) : null}
    </>
  )

  if (href) {
    return (
      <a
        className={classes}
        data-slot="reference-chip"
        href={href}
        onClick={onClick}
        {...props}
      >
        {content}
      </a>
    )
  }
  if (onClick) {
    return (
      <button
        className={classes}
        data-slot="reference-chip"
        onClick={onClick}
        type="button"
      >
        {content}
      </button>
    )
  }
  return (
    <span className={classes} data-slot="reference-chip">
      {content}
    </span>
  )
}
