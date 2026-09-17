import type { InputProps } from "../ui/input"

export type AtomSize = "xs" | "sm" | "default" | "lg" | "xl" | "xxl"
export type AtomIconSize = "xs" | "sm" | "default" | "lg" | "xl" | "xxl"
export type TMacroAtomSize = Exclude<AtomSize, "xs" | "xl" | "xxl">
export type TInputFieldSize = Record<"label" | "input" | "description" | "icon", Record<TMacroAtomSize, string>>


export interface ReferenceProps {
  /** With an href the chip renders as a link, otherwise as a button. */
  href?: string
  target?: React.HTMLAttributeAnchorTarget
  rel?: string
  id?: string
  className?: string
  children?: React.ReactNode
  "aria-label"?: string
  onClick?: React.MouseEventHandler<HTMLElement>
  /**
   * The passage the chip points at, shown in a preview card on hover or
   * focus. Omitted, the chip is just a link.
   */
  preview?: React.ReactNode
}


export interface IInputFieldProps extends Omit<InputProps, "size"> {
  label?: string
  description?: string
  error?: string
  size?: TMacroAtomSize
  invalid?: boolean
}
