import { Plus } from "lucide-react"
import type { PopoverTriggerState } from "@base-ui/react"
import type * as React from "react"
import { cn } from "@/lib/utils"

export function AddButton({
  state,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  state?: PopoverTriggerState
}) {
  return (
    <button
      {...props}
      type="button"
      aria-label="Add attachment"
      data-cuelume-press=""
      data-cuelume-release=""
      className={cn(
        "size-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-40",
        state?.open && "bg-foreground/5",
        className
      )}
    >
      <Plus aria-hidden className="size-4" />
    </button>
  )
}
