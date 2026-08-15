import { forwardRef, type HTMLAttributes, type Ref } from "react"
import { SharedLayoutBg } from "@/components/motion/shared-layout-bg"
import { cn } from "@/lib/utils"

export const AnimatedSidebarMenu = forwardRef<
  HTMLUListElement,
  HTMLAttributes<HTMLUListElement>
>(function AnimatedSidebarMenu(
  { children, className, ...props },
  forwardedRef
) {
  return (
    <SharedLayoutBg
      {...props}
      ref={forwardedRef as Ref<HTMLElement>}
      as="ul"
      inset={0}
      pillClassName="rounded-xl bg-muted/70"
      pillContainerClassName="inset-y-auto top-0 h-9"
      data-slot="sidebar-menu"
      className={cn("flex w-full min-w-0 list-none flex-col gap-0.5", className)}
    >
      {children}
    </SharedLayoutBg>
  )
})
