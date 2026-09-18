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
    <Accordion
      className={cn("flex w-full flex-col gap-2 max-w-11/12 overflow-clip rounded-md", className)}
      data-slot="recommendation-group"
      multiple={multiple}
      render={
        <motion.div
          animate="visible"
          initial="hidden"
          variants={GROUP_VARIANTS}
        />
      }
      {...props}
    />
  )
}
