import type { CSSProperties, HTMLAttributes, ReactNode } from "react"
import type { ITextSelectionProps } from "../text-selection"

export type TTextVariant =
  "default" | "heading" | "paragraph" | "link" | "subscript"
export type TTextSize = "small" | "medium" | "large" | number

export type TTextProps = Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "style"
> & {
  id?: string
  children?: ReactNode
  className?: string
  /** Named sizes use the type scale; a number is interpreted as pixels. */
  size?: TTextSize
  type?: TTextVariant
  href?: string
  /** Marks a reader selection. A string is also exposed as data-selection. */
  selection?: string | boolean
  style?: CSSProperties
}

export type THeadingProps = Omit<TTextProps, "type"> &
  Omit<ITextSelectionProps, "children" | "className">


export type TSpanProps = Omit<TTextProps, "type">
export type TParagraphProps = Omit<TTextProps, "type"> &
  Omit<ITextSelectionProps, "children" | "className">


export type TLabelLevel = "heading" | "title" | "caption" | "subtitle"

export type TLabelProps = {
  children: ReactNode
  className?: string
  /** Type scale of the label. Defaults to "title". */
  level?: TLabelLevel
  id?: string
}
