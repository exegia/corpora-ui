"use client"

import { motion } from "motion/react"
import type * as React from "react"
import {
  Accordion,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import type { TRecommendationGroupProps } from "./types"
import { GROUP_VARIANTS } from "./constant"

/**
 * Accordion root for a stack of recommendation items. Defaults to `multiple`
 * so each proposal can stay open on its own, like independent suggestion cards.
 */
export function Group({
  className,
  multiple = true,
  ...props
}: TRecommendationGroupProps): React.ReactElement {
  return (
    <motion.div
      animate="visible"
      className="w-full"
      initial="hidden"
      variants={GROUP_VARIANTS}
    >
      <Accordion
        className={cn(
          "flex w-full max-w-11/12 flex-col gap-2 overflow-clip rounded-md",
          className
        )}
        data-slot="recommendation-group"
        multiple={multiple}
        {...props}
      />
    </motion.div>
  )
}
