import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"
import type { ScaffoldSubPanelProps } from "./type"
import { subPanelVariant } from "@/components/blocks/scaffold/utils.ts"
import { SCAFFOLD_EASE, SCAFFOLD_MORPH_DURATION } from "./constants"

export function ScaffoldSubPanel({
  className,
  children,
  variant = "card",
  primary = false,
  expanded,
  ...rest
}: ScaffoldSubPanelProps): React.ReactElement {
  const reduce = useReducedMotion()
  // The primary card holds the flexible slot unless the panel says otherwise.
  const isExpanded = expanded ?? primary

  return (
    <motion.div
      // Full `layout` (position + size), not `layout="size"`: a swap flips
      // the panel's flex direction in a single commit, and only a position
      // FLIP makes the two cards glide past each other instead of teleport.
      layout
      id={`scaffold-sub-panel-${variant}`}
      // Grow is animated as a style, not a class flip — a class flip rides the
      // layout FLIP, which scales both cards into a swap-like morph. Animating
      // flex-grow slides only the shared boundary: the collapsed card grows up
      // (or down) while the other is squeezed and cropped in place.
      initial={false}
      animate={{ flexGrow: isExpanded ? 1 : 0 }}
      transition={
        reduce
          ? { duration: 0 }
          : { duration: SCAFFOLD_MORPH_DURATION, ease: SCAFFOLD_EASE }
      }
      className={cn(
        "flex w-full flex-col",
        subPanelVariant[variant],
        // basis-14 + clip let the primary squeeze down to the strip height;
        // the strip keeps its natural (basis-auto) height when collapsed.
        primary ? "min-h-14 basis-14 overflow-clip" : "min-h-14 basis-auto",
        className
      )}
      data-slot={`scaffold-sub-panel-${variant}`}
      data-expanded={isExpanded ? "" : undefined}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
