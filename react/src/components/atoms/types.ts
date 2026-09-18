import type { TInputProps } from "../ui/input"

export type TAtomSize = "xs" | "sm" | "default" | "lg" | "xl" | "xxl"
export type TAtomIconSize = "xs" | "sm" | "default" | "lg" | "xl" | "xxl"
export type TMacroAtomSize = Exclude<TAtomSize, "xs" | "xl" | "xxl">
export type TInputFieldSize = Record<"label" | "input" | "description" | "icon", Record<TMacroAtomSize, string>>


export interface IReferenceProps {
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


export interface IInputFieldProps extends Omit<TInputProps, "size"> {
  label?: string
  description?: string
  error?: string
  size?: TMacroAtomSize
  invalid?: boolean
}

export type TLoaderType = "spinner" | "dots";
export interface ILoaderProps {
  type?: TLoaderType;
  className?: string;
  size?: TAtomSize;
}

export type * from "./avatar/types"
export type * from "./background/type"
export type * from "./bubble/types"
export type * from "./text/types"
export type * from "./text-selection/types"
