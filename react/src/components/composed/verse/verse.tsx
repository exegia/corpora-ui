"use client"

import { createContext, useContext } from "react"
import type { ReactElement } from "react"
import { cn } from "@/lib/utils"
import { Text } from "../../atoms/text/default"
import { TextClickPopover } from "../../atoms/text-selection/click-popover"
import type { TTextSize } from "../../atoms/text/types"
import type { TVerseNoteProps, IVerseProps, TVerseSpanProps } from "./types"

const VerseSizeContext = createContext<TTextSize | undefined>(undefined)

const chapterClassName =
  "mr-1.5 align-super text-[0.7em] font-medium no-underline hover:underline"

export function Verse({
  chapter,
  chapterPopover,
  children,
  className,
  href,
  renderChapterPopover,
  size = "medium",
  ...props
}: IVerseProps): ReactElement {
  const hasChapterPopover =
    renderChapterPopover !== undefined ||
    (chapterPopover !== undefined && chapterPopover !== null)

  return (
    <VerseSizeContext.Provider value={size}>
      <Text
        {...props}
        className={className}
        data-verse=""
        size={size}
        type="paragraph"
      >
        {chapter !== undefined && chapter !== null ? (
          hasChapterPopover ? (
            <TextClickPopover
              className={chapterClassName}
              href={href}
              popover={chapterPopover}
              renderPopover={renderChapterPopover}
              size={size}
              type="link"
            >
              {chapter}
            </TextClickPopover>
          ) : (
            <Text
              className={chapterClassName}
              href={href}
              size={size}
              type="link"
            >
              {chapter}
            </Text>
          )
        ) : null}
        {children}
      </Text>
    </VerseSizeContext.Provider>
  )
}

export function VerseSpan({
  className,
  size,
  ...props
}: TVerseSpanProps): ReactElement {
  const verseSize = useContext(VerseSizeContext)
  return (
    <TextClickPopover
      {...props}
      className={cn(
        "underline decoration-muted-foreground/50 decoration-dotted underline-offset-4",
        className
      )}
      size={size ?? verseSize}
    />
  )
}

export function VerseNote({
  className,
  size,
  ...props
}: TVerseNoteProps): ReactElement {
  const verseSize = useContext(VerseSizeContext)
  return (
    <TextClickPopover
      {...props}
      className={cn("mx-0.5 text-[0.75em]", className)}
      size={size ?? verseSize}
      type="subscript"
    />
  )
}
