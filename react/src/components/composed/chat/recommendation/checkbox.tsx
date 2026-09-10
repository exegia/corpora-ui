import { SPRING_PRESS } from "@/lib/ease";
import { AnimatePresence, useReducedMotion } from "motion/react";
import { STATE_ICON } from "./constant";
import type { SuggestionState } from "./types";
import { cn } from "@/lib/utils";


/** The outcome mark: hollow while pending, violet check when accepted, grey cross when ignored. 
 * 
 * @description Renders the appropriate icon based on the suggestion state.
 * @param state - The suggestion state to render.
 */
export function Checkbox({ state }: { state: SuggestionState }): React.ReactElement {
  const reduceMotion = useReducedMotion()
  const transition = reduceMotion ? { duration: 0 } : SPRING_PRESS

  const renderActions = () => {
    const MotionIcon = state === "pending" ? null : STATE_ICON[state]
    return (
      <span
        className={cn(
          "inline-grid size-3.5 place-items-center rounded-full border-[1.5px] [grid-area:1/1]",
          state === "accepted"
            ? "bg-indigo-500/80 text-white"
            : state === "rejected"
              ? "bg-foreground/30 text-muted"
              : "border-neutral-700 bg-transparent dark:border-neutral-500"
        )}
        key={state}
      >
        {MotionIcon && (
          <MotionIcon
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.4, opacity: 0 }}
            initial={{ scale: 0.4, opacity: 0, rotate: -45 }}
            aria-hidden="true"
            className="size-3 stroke-[4]"
            transition={transition}
          />
        )}
      </span>
    )
  }
  return (
    <span
      className="relative inline-grid size-4 shrink-0 place-items-center"
      data-slot="suggestion-state"
      data-state={state}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {renderActions()}
      </AnimatePresence>
    </span>
  )
}
