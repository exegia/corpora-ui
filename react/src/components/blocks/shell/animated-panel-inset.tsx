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
      data-motion-panels-fill=""
      className={cn(
        // Panel bounds reserve the body's preferred width. Once navigation
        // is hidden, the body can use a container narrower than that floor.
        "bg-neutral-50 dark:bg-neutral-900 min-w-0 relative flex flex-1 flex-col",
        "overflow-hidden rounded-md",
        SHELL_BEZEL_CLASSES,
        className
      )}
    />
  )
})
