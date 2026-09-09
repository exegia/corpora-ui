import type * as React from "react"
import { cn } from "@/lib/utils"

export interface ThumbnailProps extends React.ComponentPropsWithoutRef<"span"> {
  src?: string
  alt?: string
  /** `sm` is the 40px chip tile (radius 10); `lg` the 240×160 preview (radius 14). */
  size?: "sm" | "lg"
}

/**
 * Image slot with a gradient placeholder when `src` is missing.
 *
 * @sketch "Atom / Thumbnail / Small", "Atom / Thumbnail / Large"
 */
export function Thumbnail({ src, alt = "", size = "sm", className, children, ...props }: ThumbnailProps): React.ReactElement {
  return (
    <span
      data-slot="thumbnail"
      className={cn(
        "relative block shrink-0 overflow-hidden bg-[linear-gradient(135deg,#8b7bd8_0%,#c9b3ff_45%,#f2b48a_100%)]",
        size === "sm" ? "size-10 rounded-[10px]" : "aspect-[3/2] w-60 rounded-[14px]",
        className
      )}
      {...props}
    >
      {src ? <img alt={alt} className="size-full object-cover" src={src} /> : null}
      {children}
    </span>
  )
}
