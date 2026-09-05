import type { CSSProperties, HTMLAttributes, ReactNode } from "react"

export type TextVariant =
  "default" | "heading" | "paragraph" | "link" | "subscript"
export type TextSize = "small" | "medium" | "large" | number

export type TextProps = Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "style"
> & {
  id?: string
  children?: ReactNode
  className?: string
  /** Named sizes use the type scale; a number is interpreted as pixels. */
  size?: TextSize
  type?: TextVariant
  href?: string
  /** Marks a reader selection. A string is also exposed as data-selection. */
  selection?: string | boolean
  style?: CSSProperties
}

export type LabelLevel = "heading" | "title" | "caption" | "subtitle"
export type Key = string | LabelLevel

export type LabelProps<T extends LabelLevel = LabelLevel> = {
  children: ReactNode
  className?: string
  level: T extends LabelLevel ? T : never
  id?: string
}