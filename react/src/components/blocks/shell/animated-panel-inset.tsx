import { SHELL_BEZEL_CLASSES } from "./utils"
import { forwardRef } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils.ts"
import type { TAnimatedSidebarInsetProps } from "./type"

export const AnimatedPanelInset = forwardRef<
  HTMLElement,
  TAnimatedSidebarInsetProps
>(function AnimatedSidebarInset({ className, ...props }, forwardedRef) {
  return (
    <motion.main
      {...props}
      ref={forwardedRef}
      data-slot="sidebar-inset"
      className={cn(
        // The body takes every column the panels leave (flex-1 = width 100%)
        // but never yields past its own floor: a resized panel may only take
        // the slack above --inset-min-width, and the shell drops the secondary
        // panel entirely once even that no longer fits.
        "relative flex min-w-(--inset-min-width) flex-1 flex-col bg-neutral-50 dark:bg-neutral-900",
        "overflow-hidden rounded-md",
        SHELL_BEZEL_CLASSES,
        className
      )}
    />
  )
})
