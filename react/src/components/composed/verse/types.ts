import type { HTMLAttributes, ReactNode } from "react"
import type { TTextSize } from "../../atoms/text/types"
import type { ITextClickPopoverProps } from "../../atoms/text-selection/types"

export interface IVerseProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  children?: ReactNode
  className?: string
  /** Chapter reference rendered as a leading link, e.g. "3:16". */
  chapter?: ReactNode
  /** Destination of the chapter link. */
  href?: string
  /** Popover content opened by clicking the chapter link. */
  chapterPopover?: ITextClickPopoverProps["popover"]
  renderChapterPopover?: ITextClickPopoverProps["renderPopover"]
  /** Type scale shared with nested verse spans and notes. */
  size?: TTextSize
}

export type TVerseSpanProps = Omit<ITextClickPopoverProps, "type">

export type TVerseNoteProps = Omit<ITextClickPopoverProps, "type">
