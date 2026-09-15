import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { SPRING_LAYOUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { useReducedMotion, motion } from "motion/react";


/** "Press ⌘ + ↵ to send message" — the composer's send hint. */
export function SendHint({
  className,
  verbose = true,
}: {
  className?: string
  /** Pin the keycaps to the end and drop the trailing "to send message". */
  verbose?: boolean
}): React.ReactElement {
  const reduceMotion = useReducedMotion()
  // `justify-content` and `display` are discrete — they snap rather than tween.
  // A spacer whose flex-grow rises 0 → 1 buys the start → end shift, and it
  // takes exactly the room the collapsing label gives back, so both halves ride
  // the same spring.
  const transition = reduceMotion ? { duration: 0 } : SPRING_LAYOUT

  return (
    <motion.span
      className={cn(
        "flex flex-1 items-center gap-1.5 text-sm whitespace-nowrap text-muted-foreground/60",
        className
      )}
      data-slot="send-hint"
    >
      <motion.span
        aria-hidden="true"
        animate={{ flexGrow: verbose ? 1 : 0 }}
        className="inline-flex shrink-0 basis-0 items-center"
        initial={false}
        transition={transition}
      />
      Press
      <KbdGroup className="max-h-3 items-center">
        <Kbd aria-label="Command">⌘</Kbd>
        <Kbd aria-label="Enter" className="w-8">
          ↵
        </Kbd>
      </KbdGroup>
      <motion.span
        animate={{
          opacity: verbose ? 0 : 1,
          width: verbose ? 0 : "auto",
          x: verbose ? -8 : 0,
        }}
        className="inline-block shrink-0 overflow-hidden"
        initial={false}
        transition={transition}
      >
        to send message
      </motion.span>
    </motion.span>
  )
}
