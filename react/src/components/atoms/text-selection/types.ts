import type {
  ComponentProps,
  ComponentType,
  ElementType,
  HTMLAttributes,
  ReactNode,
} from "react"
import type { HighlightPopover as HighlightPopoverPrimitive } from "@omsimos/react-highlight-popover"

export interface SelectionPosition {
  top: number
  left: number
}

export interface SelectionState {
  selected: boolean
  currentSelection: string
  showPopover: boolean
  popoverPosition: SelectionPosition | null
}

export type SelectionStateUpdate =
  Partial<SelectionState> | ((state: SelectionState) => Partial<SelectionState>)

export interface SelectionRenderProps {
  position: SelectionPosition
  selection: string
  selected: boolean
  showPopover: boolean
  setCurrentSelection: (selection: string) => void
  setShowPopover: (show: boolean) => void
  close: () => void
}

export type SelectionPopoverComponent = ComponentType<SelectionRenderProps>

export type HighlightPopoverPrimitiveProps = ComponentProps<
  typeof HighlightPopoverPrimitive
>

export interface HighlightPopoverProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  children?: ReactNode
  /** Render a component around the popover content. */
  component?: ElementType
  /** Props forwarded to the custom component. */
  componentProps?: Record<string, unknown>
  /** Render function for applications that need full control of the markup. */
  render?: (props: SelectionRenderProps) => ReactNode
}

export interface TextSelectionProps extends Omit<
  HighlightPopoverPrimitiveProps,
  | "children"
  | "renderPopover"
  | "onSelectionStart"
  | "onSelectionEnd"
  | "onPopoverShow"
  | "onPopoverHide"
> {
  children: ReactNode
  selected?: boolean
  popover?: ReactNode
  component?: ElementType
  componentProps?: Record<string, unknown>
  popoverComponent?: ElementType
  popoverProps?: Record<string, unknown>
  renderPopover?: (props: SelectionRenderProps) => ReactNode
  onSelectionStart?: () => void
  onSelectionEnd?: (selection: string) => void
  onPopoverShow?: () => void
  onPopoverHide?: () => void
}
