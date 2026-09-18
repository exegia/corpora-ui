import { isValidElement, useId, useState } from "react"
import type { ISuggestedPromptsProps } from "../type"
import { useReducedMotion, motion, AnimatePresence } from "motion/react"
import { flattenChildren, ITEM_VARIANTS, LIST_VARIANTS } from "./utils"
import { cn } from "@/lib/utils"
import { EASE_IN_OUT, SPRING_PANEL } from "@/lib/ease"
import { ChevronDown, Sparkles } from "lucide-react"

/**
 * The "Suggestions (n)" disclosure above the composer: a chevron that swings
 * from left (folded) to down (open) and a panel of prompts that fans out
 * beneath it, its bottom edge tucked behind the composer pill.
 */
export function SuggestedPrompts({
  children,
  count,
  label = (n) => `Suggestions (${n})`,
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  className,
  ...props
}: ISuggestedPromptsProps): React.ReactElement | null {
  const panelId = useId()
  const reduceMotion = useReducedMotion()
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const open = openProp ?? internalOpen
  const items = flattenChildren(children)

  const setOpen = (next: boolean): void => {
    if (openProp === undefined) setInternalOpen(next)
    onOpenChange?.(next)
  }

  // Picking the last prompt empties `children`. Collapsing the whole block on
  // height rather than returning null keeps the header from blinking out in a
  // single frame while that last row is still flying to its bubble.
  return (
    <motion.div
      animate={{
        height: items.length ? "auto" : 0,
        opacity: items.length ? 1 : 0,
      }}
      className={cn("mx-auto flex w-11/12 flex-col overflow-hidden", className)}
      data-slot="suggested-prompts"
      initial={false}
      transition={
        reduceMotion ? { duration: 0 } : { duration: 0.32, ease: EASE_IN_OUT }
      }
      {...props}
    >
      <motion.button
        aria-controls={panelId}
        aria-expanded={open}
        className="mx-auto flex w-full cursor-pointer items-center gap-2 px-4 py-1 text-xs text-muted-foreground transition-colors duration-150 ease-smooth-out outline-none hover:text-foreground focus-visible:text-foreground"
        data-slot="suggested-prompts-trigger"
        onClick={() => setOpen(!open)}
        type="button"
        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      >
        <Sparkles aria-hidden="true" className="size-3.5 stroke-[1.5]" />
        <span className="flex-1 text-left">{label(count ?? items.length)}</span>
        <motion.span
          animate={{ rotate: open ? 0 : 90 }}
          className="inline-flex"
          initial={false}
          transition={reduceMotion ? { duration: 0 } : SPRING_PANEL}
        >
          <ChevronDown aria-hidden="true" className="size-4 stroke-2" />
        </motion.span>
      </motion.button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            // A plain height tween, deliberately not a `layout` projection —
            // the composer shell below animates its own scale, and a second
            // projection over the same box breaks its scale correction.
            className="overflow-hidden"
            exit={{ height: 0, opacity: 0 }}
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.32, ease: EASE_IN_OUT }
            }
          >
            <motion.div
              animate="visible"
              // The bottom padding is what the composer pill sits over, so the
              // panel reads as tucked behind it rather than stacked on it.
              className="mt-1 -mb-5 flex flex-col gap-0.5 rounded-md border-t border-t-border bg-secondary p-1.5 pb-6"
              exit="hidden"
              initial={reduceMotion ? false : "hidden"}
              variants={LIST_VARIANTS}
            >
              {items.map((item, index) => (
                <motion.div
                  key={
                    isValidElement(item) && item.key != null ? item.key : index
                  }
                  variants={reduceMotion ? undefined : ITEM_VARIANTS}
                >
                  {item}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}
