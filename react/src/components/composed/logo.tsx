"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import type { Variants } from "motion/react"

import { EASE_OUT } from "@/lib/ease.ts"
import { cn } from "@/lib/utils"
import { initialsFrom } from "@/components/user-avatar"

/** `full` shows mark + wordmark; `mark` folds the wordmark away — an icon
 * rail, a favicon-sized corner. */
export type LogoVariant = "full" | "mark"

export interface LogoProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  /**
   * Brand name. Labels the logo for AT (and the link, when `href` renders
   * one), drives the default wordmark, and the monogram tile when no mark
   * is given.
   */
  name: string
  /** Custom mark — an inline SVG sized to fill its box. Wins over `src`. */
  mark?: React.ReactNode
  /** Image URL for the mark. Decorative — `name` labels the logo. */
  src?: string
  /** Wordmark content. Defaults to `name`. */
  wordmark?: React.ReactNode
  /** `full` (default) or `mark` — the wordmark folds away, animated. */
  variant?: LogoVariant
  /** Renders the logo as a link — the usual "mark goes home" affordance. */
  href?: string
}

/** Wordmark fold/unfold — the same envelope the profile card's identity
 * lines use, so a logo and a profile card folding in the same rail move as
 * one. Kept local: composed components do not reach into blocks. Expressed
 * as variants, not a plain `animate` object — motion 13 does not pick up
 * object-target changes on this span, while named variants animate. */
const WORDMARK_VARIANTS: Variants = {
  open: {
    width: "auto",
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, delay: 0.08, ease: EASE_OUT },
  },
  folded: {
    width: 0,
    opacity: 0,
    x: -4,
    transition: { duration: 0.12, ease: EASE_OUT },
  },
}

const WORDMARK_VARIANTS_REDUCED: Variants = {
  open: { width: "auto", opacity: 1, x: 0, transition: { duration: 0.16, ease: EASE_OUT } },
  folded: { width: 0, opacity: 0, x: 0, transition: { duration: 0.16, ease: EASE_OUT } },
}

/**
 * Brand lockup: a mark beside a wordmark. The mark is whatever the brand
 * has — an SVG (`mark`), an image (`src`), or, given neither, a monogram
 * tile derived from `name`. `variant="mark"` folds the wordmark away with
 * the same motion a collapsing rail uses, so the lockup can sit in one and
 * follow its fold. With `href` the whole lockup is a link named by `name`.
 *
 * Sizing rides on the mark: it defaults to `size-8`; restyle via
 * `[&_[data-slot=logo-mark]]:size-*` or wrap in a text-size context for the
 * wordmark, which inherits.
 */
export function Logo({
  name,
  mark,
  src,
  wordmark,
  variant = "full",
  href,
  className,
  ...props
}: LogoProps): React.ReactElement {
  const reduce = useReducedMotion()
  const folded = variant === "mark"

  const markNode = mark ?? (
    src !== undefined ? (
      // Decorative: the root's `name` (visible wordmark or aria-label)
      // already names the brand.
      <img alt="" className="size-full object-contain" src={src} />
    ) : (
      <span
        aria-hidden="true"
        className="flex size-full items-center justify-center rounded-lg bg-foreground font-semibold text-background text-[45cqw]"
        data-slot="logo-monogram"
      >
        {initialsFrom(name)}
      </span>
    )
  )

  const content = (
    <>
      <span
        className="size-8 shrink-0 @container [&_svg]:size-full"
        data-slot="logo-mark"
      >
        {markNode}
      </span>
      <motion.span
        animate={folded ? "folded" : "open"}
        variants={reduce ? WORDMARK_VARIANTS_REDUCED : WORDMARK_VARIANTS}
        // Folded, the wordmark is gone for AT too — the root's label names
        // the brand on its own.
        aria-hidden={folded || undefined}
        className={cn(
          "min-w-0 overflow-hidden font-semibold whitespace-nowrap tracking-tight",
          folded && "pointer-events-none",
          // 0px wide while folded, but the flex gap before it would still
          // offset the mark — pull it back by that gap.
          folded && "-ml-2"
        )}
        data-slot="logo-wordmark"
        initial={false}
      >
        {wordmark ?? name}
      </motion.span>
    </>
  )

  const rootClassName = cn(
    "inline-flex shrink-0 items-center gap-2 text-foreground",
    className
  )

  return href !== undefined ? (
    <a
      // Always labelled: the folded state hides the wordmark, and a link
      // must not lose its name mid-animation.
      aria-label={name}
      className={rootClassName}
      data-slot="logo"
      data-variant={variant}
      href={href}
      {...props}
    >
      {content}
    </a>
  ) : (
    <span
      aria-label={folded ? name : undefined}
      className={rootClassName}
      data-slot="logo"
      data-variant={variant}
      role={folded ? "img" : undefined}
      {...props}
    >
      {content}
    </span>
  )
}
