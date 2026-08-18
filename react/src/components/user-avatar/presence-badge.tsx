import { cn } from "@/lib/utils"
import type { UserPresence } from "./type"

/**
 * Corner dot naming whether the person is reachable. Sits on the avatar
 * frame, outside the clipped circle, with a background-coloured ring so it
 * reads against any image. Colour is not the only signal: `offline` is a
 * hollow ring, `online` a filled dot, and the label is spelled out for AT.
 */
export function PresenceBadge({
  presence,
  className,
}: {
  presence: UserPresence
  className?: string
}) {
  const online = presence === "online"
  return (
    <span
      aria-label={online ? "Online" : "Offline"}
      className={cn(
        "absolute right-0 bottom-0 box-content size-[22%] min-h-1.5 min-w-1.5 rounded-full",
        "ring-2 ring-background transition-colors duration-150 ease-smooth-out",
        online
          ? "bg-emerald-500 dark:bg-emerald-400"
          : "border-2 border-muted-foreground/60 bg-background dark:border-muted-foreground/70",
        className
      )}
      data-presence={presence}
      data-slot="user-avatar-presence"
      role="img"
    />
  )
}
