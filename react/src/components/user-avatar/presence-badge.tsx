import { cn } from "@/lib/utils"
import type { UserPresence } from "./type"

/**
 * Corner dot naming whether the person is reachable. Sits on the avatar
 * frame, outside the clipped circle, with a background-coloured ring so it
 * reads against any image. Colour is not the only signal: `offline` is a
 * hollow ring, `online` a filled dot, and the label is spelled out for AT.
 *
 * `lightAngle` (degrees clockwise from 12) lays a faint sheen across the dot
 * from that side — the same angle the avatar's bezel is lit from, so the two
 * highlights agree and the badge reads as a bead sitting in the same light.
 */
export function PresenceBadge({
  presence,
  lightAngle,
  className,
}: {
  presence: UserPresence
  lightAngle?: number
  className?: string
}) {
  const online = presence === "online"
  return (
    <span
      aria-label={online ? "Online" : "Offline"}
      className={cn(
        "absolute right-0 bottom-0 box-content size-[22%] min-h-1.5 min-w-1.5 overflow-hidden rounded-full",
        "ring-2 ring-background transition-colors duration-150 ease-smooth-out",
        online
          ? "bg-emerald-500 dark:bg-emerald-400"
          : "border-2 border-muted-foreground/60 bg-background dark:border-muted-foreground/70",
        className
      )}
      data-presence={presence}
      data-slot="user-avatar-presence"
      role="img"
    >
      {lightAngle !== undefined ? (
        // Highlight at 12 o'clock, fading out by the middle, rotated so it
        // faces the light. Rotation transitions; the gradient is static.
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full",
            "bg-[linear-gradient(to_bottom,--theme(--color-white/55%),--theme(--color-white/12%)_38%,transparent_58%)]",
            "dark:bg-[linear-gradient(to_bottom,--theme(--color-white/40%),--theme(--color-white/8%)_38%,transparent_58%)]",
            "transition-transform duration-150 ease-smooth-out motion-reduce:transition-none"
          )}
          data-slot="user-avatar-presence-sheen"
          style={{ transform: `rotate(${lightAngle}deg)` }}
        />
      ) : null}
    </span>
  )
}
