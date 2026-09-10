import { createElement } from "react"
import { cn } from "@/lib/utils"
import type { TextProps, TextSize, TextVariant } from "./types"

const variantClasses: Record<TextVariant, string> = {
  default: "text-foreground",
  heading: "font-heading text-2xl font-semibold tracking-tight text-foreground",
  paragraph: "leading-7 text-foreground",
  link: "text-primary underline underline-offset-4 hover:text-primary/80",
  subscript: "align-sub text-xs text-muted-foreground",
}

const sizeClasses: Record<Exclude<TextSize, number>, string> = {
  small: "text-sm",
  medium: "text-base",
  large: "text-lg",
}

const defaultTags: Record<TextVariant, keyof HTMLElementTagNameMap> = {
  default: "span",
  heading: "h2",
  paragraph: "p",
  link: "a",
  subscript: "sub",
}

export function Text({
  children,
  className,
  id,
  selection,
  size = "medium",
  style,
  type = "default",
  ...props
}: TextProps) {
  const tag = defaultTags[type]
  const fontSize = typeof size === "number" ? `${size}px` : undefined
  const selectionValue =
    typeof selection === "string" ? selection : selection ? "" : undefined

  return createElement(
    tag,
    {
      ...props,
      className: cn(
        variantClasses[type],
        typeof size === "number" ? undefined : sizeClasses[size],
        selectionValue !== undefined &&
          "rounded-xs outline-1 outline-offset-2 outline-accent/45",
        className
      ),
      "data-selection": selectionValue,
      id,
      style: { ...style, ...(fontSize ? { fontSize } : {}) },
    },
    children
  )
}
