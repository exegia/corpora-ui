import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from "react"

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
  /** Reaches the rendered element (React 19 passes `ref` as a prop). */
  ref?: Ref<HTMLElement>
  /** Named sizes use the type scale; a number is interpreted as pixels. */
  size?: TTextSize
  type?: TTextVariant
  href?: string
  /** Marks a reader selection. A string is also exposed as data-selection. */
  selection?: string | boolean
  style?: CSSProperties
}

export type THeadingProps = Omit<TTextProps, "type">

export type TSpanProps = Omit<TTextProps, "type">

export type TParagraphProps = Omit<TTextProps, "type">

export type TLabelLevel = "heading" | "title" | "caption" | "subtitle"

export type TLabelProps = {
  children: ReactNode
  className?: string
  /** Type scale of the label. Defaults to "title". */
  level?: TLabelLevel
  id?: string
}
