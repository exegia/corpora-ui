import type { TextProps } from "./types"
import { Text } from "./default"
import { cn } from "@/lib/utils"

export type SpanProps = Omit<TextProps, "type">

export function Span(props: SpanProps) {
  return (
    <Text
      {...props}
      className={cn("select-text selection:bg-transparent", props.className)}
      type="default"
    />
  )
}
