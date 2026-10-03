import type { ComponentProps, ReactNode, RefObject } from "react"
import type { PopoverRoot } from "@base-ui/react/popover"
import type { PopoverPopup } from "@/components/ui/popover"
import type { TPopoverGlassProps } from "@/components/ui/popover-glass"

export interface ITextPopoverRenderProps {
  open: boolean
  setOpen: (open: boolean) => void
  close: () => void
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
