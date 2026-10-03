import type {
  ComponentProps,
  ComponentType,
  ElementType,
  HTMLAttributes,
  ReactNode,
  RefObject,
} from "react"
import type { HighlightPopover as HighlightPopoverPrimitive } from "@omsimos/react-highlight-popover"
import type { PopoverRoot } from "@base-ui/react/popover"
import type { PopoverPopup } from "@/components/ui/popover"
import type { TPopoverGlassProps } from "@/components/ui/popover-glass"
import type { TTextProps } from "../type"

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
  | Partial<ISelectionState>
  | ((state: ISelectionState) => Partial<ISelectionState>)

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

/* ------------------------------------------------------------------ */
/* Anchored popover                                                    */
/* ------------------------------------------------------------------ */

export type TAnchoredPopoverTrigger = "selection" | "click" | "hover"

/** Why the popover opened (first row) or changed (second row). */
export type TAnchoredPopoverReason =
  | "selection" | "click" | "keyboard" | "hover"
  | "collapse" | "toggle" | "leave" | "dismiss" | "show" | "hide"

/** Plain viewport rect — what the store holds; never a DOM node. */
export interface IAnchorRect {
  x: number
  y: number
  width: number
  height: number
}

/** Base UI's virtual-element shape, declared locally so consumers need no floating-ui import. */
export interface IVirtualAnchor {
  getBoundingClientRect: () => DOMRect
  contextElement?: Element
}

export type TAnchoredPopoverMatch = string | ((element: Element) => boolean)

/** What `show()` accepts: an element, a `Range`, a rect, or a point. */
export type TAnchorInput = Element | Range | DOMRect | IAnchorRect | { x: number; y: number }

export interface IAnchoredPopoverContext {
  /** The matched element (click/hover), the selection's common ancestor, or null. */
  target: Element | null
  /** The selected text, or the target's `textContent`. */
  text: string
  /** Null for imperative `show()`. */
  event: Event | null
}

export interface IUseAnchoredPopoverOptions<TPayload = unknown> {
  /** The view. Listeners attach here; selections outside it are ignored. */
  ref: RefObject<HTMLElement | null>
  /** Instance id. Defaults to `useId()`; an explicit id outlives the component. */
  id?: string
  /** Which events open the popover. Default `["selection"]`. */
  trigger?: TAnchoredPopoverTrigger | TAnchoredPopoverTrigger[]
  /** click/hover only: which descendants count as targets. Default: any element. */
  match?: TAnchoredPopoverMatch
  /** Resolve the payload handed to the popup when it opens. */
  getPayload?: (context: IAnchoredPopoverContext) => TPayload
  /** click/hover only. `"target"` (default) anchors to the matched element, `"pointer"` to the event point. */
  anchorTo?: "target" | "pointer"
  /** selection only. Shorter selections do not open. Default 1. */
  minSelectionLength?: number
  /** hover only. Default 300 ms. */
  hoverDelay?: number
  /** hover only. Default 150 ms. */
  hoverCloseDelay?: number
  onOpenChange?: (open: boolean, reason: TAnchoredPopoverReason) => void
}

export interface IAnchoredPopoverState {
  open: boolean
  text: string
  rect: IAnchorRect | null
  payload: unknown
}

export interface IShowAnchoredPopoverArgs {
  rect: IAnchorRect
  text: string
  payload?: unknown
}

export interface IAnchoredPopoverActions {
  show: (args: IShowAnchoredPopoverArgs) => void
  hide: () => void
}

/** What the hook hands to `<AnchoredPopover>` — spread `popoverProps`. */
export interface IAnchoredPopoverControlProps<TPayload = unknown> {
  id: string
  open: boolean
  anchor: IVirtualAnchor | null
  text: string
  payload: TPayload | undefined
  /** Base UI details arrive on dismissals; absent for the render-prop `close`/`setOpen`. */
  onOpenChange: (open: boolean, details?: PopoverRoot.ChangeEventDetails) => void
  /** Hover mode: keep the popup open while the pointer is inside it. */
  onPopupPointerEnter: () => void
  onPopupPointerLeave: () => void
}

export interface IUseAnchoredPopoverResult<TPayload = unknown> {
  open: boolean
  text: string
  payload: TPayload | undefined
  /** The matched element. Lives in the hook, never in the store. */
  target: Element | null
  anchor: IVirtualAnchor | null
  show: (anchor: TAnchorInput, payload?: TPayload) => void
  hide: () => void
  popoverProps: IAnchoredPopoverControlProps<TPayload>
}

export interface IAnchoredPopoverRenderProps<TPayload = unknown> extends ITextPopoverRenderProps {
  text: string
  payload: TPayload | undefined
}

/** Positioner/popup props a consumer may set on `<AnchoredPopover>`. */
export type TAnchoredPopoverPopupProps = Omit<
  ComponentProps<typeof PopoverPopup>,
  "anchor" | "children" | "onPointerEnter" | "onPointerLeave" | "onMouseDown"
>

type TAnchoredPopoverVariantProps =
  | { variant?: "default"; glassVariant?: never }
  | { variant: "glass"; glassVariant?: TPopoverGlassProps["glassVariant"] }

export type IAnchoredPopoverProps<TPayload = unknown> = IAnchoredPopoverControlProps<TPayload> &
  TAnchoredPopoverPopupProps &
  TAnchoredPopoverVariantProps & {
    children?: ReactNode | ((props: IAnchoredPopoverRenderProps<TPayload>) => ReactNode)
  }
