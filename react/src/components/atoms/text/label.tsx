import type { TLabelProps } from "./types"
import { cn } from "@/lib/utils"
import { twLabelClasses } from "./utils"
export function Label({ children, level = "title", className }: TLabelProps) {
  return (
    <div
      className={cn(
        "leading-1 select-none",
        level && twLabelClasses[level],
        className
      )}
    >
      {children}
    </div>
  )
}
