import type { HTMLAttributes, ReactNode } from "react"
import type { TTextProps, TTextSize } from "@/components/atoms/text/type"
import type { ITextPopoverRenderProps, TAnchoredPopoverPopupProps } from "@/components/atoms/type"

/** Popover content a verse part can carry. One popup per verse renders whichever part was activated. */
export interface IVersePopoverProps {
  /** Popover content opened by clicking the part. */
  popover?: ReactNode
  /** Render function for applications that need full control of the markup. */
  renderPopover?: (props: ITextPopoverRenderProps) => ReactNode
  /** Positioner/popup props (side, align, className, …) applied while this part's popover is open. */
  popoverProps?: TAnchoredPopoverPopupProps
}

export interface IVerseProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  children?: ReactNode
  className?: string
  /** Chapter reference rendered as a leading link, e.g. "3:16". */
  chapter?: ReactNode
  /** Destination of the chapter link. */
  href?: string
  /** Popover content opened by clicking the chapter link. */
  chapterPopover?: IVersePopoverProps["popover"]
  renderChapterPopover?: IVersePopoverProps["renderPopover"]
  /** Type scale shared with nested verse spans and notes. */
  size?: TTextSize
}

// `popover` is dropped from the text props because HTML's own `popover`
// attribute would otherwise collide with the verse popover content.
export type TVerseSpanProps = Omit<TTextProps, "type" | "popover"> & IVersePopoverProps

export type TVerseNoteProps = Omit<TTextProps, "type" | "popover"> & IVersePopoverProps
