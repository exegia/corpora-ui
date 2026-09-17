import type { SpanProps } from "./types"
import { Text } from "./default"
import { cn } from "@/lib/utils"


export function Span(props: SpanProps) {
  return (
    <Text
      {...props}
      className={cn("select-text selection:bg-transparent", props.className)}
      type="default"
    />
  )
}
