import type { HTMLAttributes, ReactNode } from "react"
import type { TextSize } from "../../atoms/text/types"
import type { TextClickPopoverProps } from "../../atoms/text-selection/types"

export interface VerseProps extends Omit<
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
  chapterPopover?: TextClickPopoverProps["popover"]
  renderChapterPopover?: TextClickPopoverProps["renderPopover"]
  /** Type scale shared with nested verse spans and notes. */
  size?: TextSize
}

export type VerseSpanProps = Omit<TextClickPopoverProps, "type">

export type VerseNoteProps = Omit<TextClickPopoverProps, "type">
