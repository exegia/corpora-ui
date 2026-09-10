"use client"

import { motion } from "motion/react"
import type * as React from "react"
import {
  Accordion,
  AccordionPrimitive,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

export type RecommendationGroupProps = AccordionPrimitive.Root.Props

/** Rows enter staggered 80ms apart; each Item picks up `row` from `ROW_VARIANTS`. */
const GROUP_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
} as const

/**
 * Accordion root for a stack of recommendation items. Defaults to `multiple`
 * so each proposal can stay open on its own, like independent suggestion cards.
 */
export function Group({
  className,
  multiple = true,
  ...props
}: RecommendationGroupProps): React.ReactElement {
  return (
    <Accordion
      className={cn("flex w-full flex-col gap-2", className)}
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
