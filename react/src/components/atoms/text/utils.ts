import type { ClassValue } from "clsx"
import type { LabelProps } from "./types"

export const twClasses: Record<string, ClassValue> = {
  default: "selection:text-amber-500 dark:selection:text-amber-400",
}

export const twLabelClasses: Record<
  NonNullable<LabelProps["level"]>,
  Element["className"]
> = {
  title: "text-xl text-neutral-500",
  subtitle: "text-lg text-neutral-500",
  caption: "text-xs text-neutral-400 dark:text-neutral-700",
  heading: "text-sm text-neutral-500",
}
