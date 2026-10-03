import { cn } from "@/lib/utils"
import { Text } from "./default"
import type { TParagraphProps } from "./type"
import { twClasses } from "./utils"

export function Paragraph({ className, ...props }: TParagraphProps) {
  return <Text {...props} className={cn(twClasses["default"], className)} type="paragraph" />
}
