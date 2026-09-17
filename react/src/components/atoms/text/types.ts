import type { CSSProperties, HTMLAttributes, ReactNode } from "react"
import type { TextSelectionProps } from "../text-selection"

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

export type HeadingProps = Omit<TextProps, "type"> &
  Omit<TextSelectionProps, "children" | "className">


export type SpanProps = Omit<TextProps, "type">
export type ParagraphProps = Omit<TextProps, "type"> &
  Omit<TextSelectionProps, "children" | "className">


export type LabelLevel = "heading" | "title" | "caption" | "subtitle"

export type LabelProps = {
  children: ReactNode
  className?: string
  /** Type scale of the label. Defaults to "title". */
  level?: LabelLevel
  id?: string
}
