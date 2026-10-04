import { cn } from "@/lib/utils"
import { Text } from "./default"
import type { THeadingProps } from "./type"
import { twClasses } from "./utils"

export function Heading({ className, ...props }: THeadingProps) {
  return <Text {...props} className={cn(twClasses["default"], className)} type="heading" />
}
