import type * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarHandleProps extends React.ComponentPropsWithoutRef<"span"> {
  src?: string
  /** Initials shown when no image loads; two characters at most. */
  initials?: string
  size?: 16 | 20
}

/**
 * 20px avatar for @-handle chips and reply headers.
 *
 * @sketch "Atom / Avatar / Handle 20"
 */
export function AvatarHandle({ src, initials, size = 20, className, ...props }: AvatarHandleProps): React.ReactElement {
  return (
    <span
      data-slot="avatar-handle"
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-accent-subtle font-semibold text-accent-text",
        size === 20 ? "size-5 text-[8px]" : "size-4 text-[7px]",
        className
      )}
      {...props}
    >
      {src ? <img alt="" className="size-full object-cover" src={src} /> : initials?.slice(0, 2).toUpperCase()}
    </span>
  )
}
