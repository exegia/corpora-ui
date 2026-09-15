export type AtomSize = "xs" | "sm" | "default" | "lg" | "xl" | "xxl"

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
