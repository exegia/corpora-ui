import { Globe } from "lucide-react"
import type * as React from "react"
import { cn } from "@/lib/utils"

/**
 * 28×14 uppercase file-format badge ("PDF", "CSV").
 *
 * @sketch "Atom / Badge / File Type"
 */
export function FileTypeBadge({ className, children, ...props }: React.ComponentPropsWithoutRef<"span">): React.ReactElement {
  return (
    <span
      data-slot="file-type-badge"
      className={cn(
        "inline-flex h-3.5 min-w-7 shrink-0 items-center justify-center rounded-[4px] bg-surface-subtle px-1 text-[8px] font-bold uppercase leading-none tracking-wide text-text-secondary",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export interface FaviconProps extends React.ComponentPropsWithoutRef<"span"> {
  src?: string
  size?: 14 | 16
}

/**
 * 16px site icon tile with a globe fallback.
 *
 * @sketch "Atom / Favicon"
 */
export function Favicon({ src, size = 16, className, ...props }: FaviconProps): React.ReactElement {
  return (
    <span
      data-slot="favicon"
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[4px] bg-surface-subtle text-icon",
        size === 16 ? "size-4 [&_svg]:size-2.5" : "size-3.5 [&_svg]:size-2",
        className
      )}
      {...props}
    >
      {src ? <img alt="" className="size-full object-cover" src={src} /> : <Globe />}
    </span>
  )
}

/**
 * Scrim pill with a mono duration ("0:42"), bottom-right of media previews.
 *
 * @sketch "Atom / Duration Pill"
 */
export function DurationPill({ className, children, ...props }: React.ComponentPropsWithoutRef<"span">): React.ReactElement {
  return (
    <span
      data-slot="duration-pill"
      className={cn(
        "inline-flex h-4 shrink-0 items-center rounded-[4px] bg-overlay-scrim px-1.5 font-mono text-[10px] font-medium leading-none text-overlay-on-media",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

/**
 * 3px accent bar that rails a quote or reply.
 *
 * @sketch "Atom / Quote Rail"
 */
export function QuoteRail({ className, ...props }: React.ComponentPropsWithoutRef<"span">): React.ReactElement {
  return (
    <span
      aria-hidden="true"
      data-slot="quote-rail"
      className={cn("block w-[3px] shrink-0 self-stretch rounded-full bg-accent-default", className)}
      {...props}
    />
  )
}
