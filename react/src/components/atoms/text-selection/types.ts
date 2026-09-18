import type {
  ComponentProps,
  ComponentType,
  ElementType,
  HTMLAttributes,
  ReactNode,
} from "react"
import type { HighlightPopover as HighlightPopoverPrimitive } from "@omsimos/react-highlight-popover"
import type { PopoverPopup } from "@/components/ui/popover"
import type { TTextProps } from "../text/types"

export interface ISelectionPosition {
  top: number
  left: number
}

export interface ISelectionState {
  selected: boolean
  currentSelection: string
  showPopover: boolean
  popoverPosition: ISelectionPosition | null
}

export type TSelectionStateUpdate =
  Partial<ISelectionState> | ((state: ISelectionState) => Partial<ISelectionState>)

export interface ISelectionRenderProps {
  position: ISelectionPosition
  selection: string
  selected: boolean
  showPopover: boolean
  setCurrentSelection: (selection: string) => void
  setShowPopover: (show: boolean) => void
  close: () => void
}

export type TSelectionPopoverComponent = ComponentType<ISelectionRenderProps>

export type THighlightPopoverPrimitiveProps = ComponentProps<
  typeof HighlightPopoverPrimitive
>

export interface IHighlightPopoverProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  children?: ReactNode
  /** Render a component around the popover content. */
  component?: ElementType
  /** Props forwarded to the custom component. */
  componentProps?: Record<string, unknown>
  /** Render function for applications that need full control of the markup. */
  render?: (props: ISelectionRenderProps) => ReactNode
}

export interface ITextSelectionProps extends Omit<
  THighlightPopoverPrimitiveProps,
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
  renderPopover?: (props: ISelectionRenderProps) => ReactNode
  onSelectionStart?: () => void
  onSelectionEnd?: (selection: string) => void
  onPopoverShow?: () => void
  onPopoverHide?: () => void
}


export interface ITextPopoverRenderProps {
  open: boolean
  setOpen: (open: boolean) => void
  close: () => void
}

export interface ITextClickPopoverProps extends Omit<TTextProps, "popover"> {
  /** Popover content rendered when the text is clicked. */
  popover?: ReactNode
  /** Render function for applications that need full control of the markup. */
  renderPopover?: (props: ITextPopoverRenderProps) => ReactNode
  /** Props forwarded to the popup (side, align, className, …). */
  popoverProps?: ComponentProps<typeof PopoverPopup>
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export interface IUseSelectionOptions {
  selected?: boolean
  onSelectionStart?: () => void
  onSelectionEnd?: (selection: string) => void
  onPopoverShow?: () => void
  onPopoverHide?: () => void
}

export interface IUseSelectionResult {
  state: ISelectionState
  selected: boolean
  currentSelection: string
  showPopover: boolean
  popoverPosition: ISelectionState["popoverPosition"]
  setSelection: (selection: string) => void
  setPosition: (
    position: NonNullable<ISelectionState["popoverPosition"]>
  ) => void
  setShowPopover: (show: boolean) => void
  update: (update: TSelectionStateUpdate) => void
  reset: () => void
  selectionProps: {
    onSelectionStart: () => void
    onSelectionEnd: (selection: string) => void
    onPopoverShow: () => void
    onPopoverHide: () => void
  }
}
