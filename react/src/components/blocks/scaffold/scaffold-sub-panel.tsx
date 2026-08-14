
import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ScaffoldSubPanelProps } from "./type"
import { subPanelVariant } from "@/components/blocks/scaffold/utils.ts"
import { SCAFFOLD_EASE, SCAFFOLD_MORPH_DURATION } from "./constants"

export function ScaffoldSubPanel({
                                   className,
                                   children,
                                   variant = 'card',
                                   primary = false,
                                   expanded,
                                   ...rest
                                 }: ScaffoldSubPanelProps): React.ReactElement {
  const reduce = useReducedMotion()
  // The primary card holds the flexible slot unless the panel says otherwise.
  const isExpanded = expanded ?? primary

  return (
    <motion.div
      layout={"size"}
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
        primary ? "basis-14 min-h-14 overflow-clip" : "basis-auto min-h-14",
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
