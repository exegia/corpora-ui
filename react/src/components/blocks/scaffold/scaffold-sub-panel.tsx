
import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ScaffoldSubPanelProps } from "./type"
import { subPanelVariant } from "@/components/blocks/scaffold/utils.ts"

export function ScaffoldSubPanel({
  className,
  children,
  variant = 'card',
  prominence,
  ...rest
}: ScaffoldSubPanelProps): React.ReactElement {
  return (
    <motion.div
      layout={"size"}
      id={`scaffold-sub-panel-${variant}`}
      className={cn(
        "flex w-full flex-col",
        subPanelVariant[variant],
        prominence === 'primary' ? 'flex-1' : 'min-h-14',
        className
      )}
      data-slot={`scaffold-sub-panel-${variant}`}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
