import { ArrowUp, Square } from "lucide-react"
import { cn } from "@/lib/utils"
import type { IComposerSubmitButtonProps } from "../type"
import type * as React from "react"

export function SendButton({
  isStreaming,
  isExpanded: _isExpanded,
  disabled,
  onStop,
  className,
  ...props
}: IComposerSubmitButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement>): React.ReactElement {
  return (
    <button
      {...props}
      type={isStreaming ? "button" : "submit"}
      aria-label={isStreaming ? "Stop" : "Send message"}
      data-cuelume-press=""
      data-cuelume-release=""
      disabled={disabled}
      onClick={isStreaming ? onStop : undefined}
      className={cn(
        "size-7 flex shrink-0 items-center justify-center rounded-lg bg-foreground text-background transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-ring disabled:bg-foreground/10 disabled:text-muted-foreground disabled:opacity-60",
        className
      )}
    >
      {isStreaming ? (
        <Square aria-hidden className="size-3 fill-current" />
      ) : (
        <ArrowUp aria-hidden className="size-4 stroke-[2.4]" />
      )}
    </button>
  )
}
