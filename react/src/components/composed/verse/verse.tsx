"use client"

import { createContext, useCallback, useContext, useId, useLayoutEffect, useMemo, useRef } from "react"
import type { ReactElement, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Text } from "@/components/atoms/text/default"
import { AnchoredPopover, useAnchoredPopover } from "@/components/atoms/text/selection"
import type { TTextSize } from "@/components/atoms/text/type"
import type { ITextPopoverRenderProps } from "@/components/atoms/type"
import type { IVersePopoverProps, IVerseProps, TVerseNoteProps, TVerseSpanProps } from "./type"

/** Every part with popover content registers here under a `useId()` key; the payload is that key. */
interface IVerseContextValue {
  size?: TTextSize
  openKey: string | null
  register: (key: string, entry: IVersePopoverProps) => () => void
}

const VerseContext = createContext<IVerseContextValue>({
  openKey: null,
  register: () => () => {},
})

const chapterClassName = "mr-1.5 align-super text-[0.7em] font-medium no-underline hover:underline"

function hasContent(entry: IVersePopoverProps): boolean {
  return entry.renderPopover !== undefined || (entry.popover !== undefined && entry.popover !== null)
}

/** Registers a part's popover content and returns the attributes that make it a target. */
function useVersePart(entry: IVersePopoverProps) {
  const { size, openKey, register } = useContext(VerseContext)
  const key = useId()
  const active = hasContent(entry)
  const { popover, renderPopover, popoverProps } = entry
  useLayoutEffect(() => {
    if (!active) return
    return register(key, { popover, renderPopover, popoverProps })
  }, [active, key, popover, popoverProps, register, renderPopover])
  const attributes = active
    ? {
        "data-verse-popover": key,
        "aria-haspopup": "dialog" as const,
        "aria-expanded": openKey === key,
      }
    : {}
  return { size, active, attributes }
}

function renderVerseEntry(
  entry: IVersePopoverProps | undefined,
  renderProps: ITextPopoverRenderProps
): ReactNode {
  if (!entry) return null
  if (entry.renderPopover) return entry.renderPopover(renderProps)
  return entry.popover
}

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
  const ref = useRef<HTMLElement>(null)
  const registry = useRef(new Map<string, IVersePopoverProps>())
  const popover = useAnchoredPopover<string>({
    ref,
    trigger: "click",
    match: "[data-verse-popover]",
    getPayload: ({ target }) => target?.getAttribute("data-verse-popover") ?? "",
  })

  const register = useCallback((key: string, entry: IVersePopoverProps) => {
    registry.current.set(key, entry)
    return () => {
      registry.current.delete(key)
    }
  }, [])

  const openKey = popover.open ? (popover.payload ?? null) : null
  const context = useMemo<IVerseContextValue>(() => ({ size, openKey, register }), [size, openKey, register])

  const chapterKey = useId()
  const chapterActive = hasContent({ popover: chapterPopover, renderPopover: renderChapterPopover })
  useLayoutEffect(() => {
    if (!chapterActive) return
    return register(chapterKey, { popover: chapterPopover, renderPopover: renderChapterPopover })
  }, [chapterActive, chapterKey, chapterPopover, register, renderChapterPopover])

  // Looked up at render so content edits while open show immediately. The
  // registry is a ref because registration happens in layout effects; reading
  // it here is safe — it is written before the popover can open.
  const activeEntry = openKey ? registry.current.get(openKey) : undefined

  return (
    <VerseContext.Provider value={context}>
      <Text {...props} className={className} data-verse="" ref={ref} size={size} type="paragraph">
        {chapter !== undefined && chapter !== null ? (
          <Text
            className={chapterClassName}
            href={href}
            size={size}
            type="link"
            {...(chapterActive
              ? {
                  "data-verse-popover": chapterKey,
                  "aria-haspopup": "dialog" as const,
                  "aria-expanded": openKey === chapterKey,
                }
              : {})}
          >
            {chapter}
          </Text>
        ) : null}
        {children}
      </Text>
      <AnchoredPopover {...popover.popoverProps} {...activeEntry?.popoverProps}>
        {(renderProps) => renderVerseEntry(activeEntry, renderProps)}
      </AnchoredPopover>
    </VerseContext.Provider>
  )
}

export function VerseSpan({
  className,
  size,
  popover,
  renderPopover,
  popoverProps,
  ...props
}: TVerseSpanProps): ReactElement {
  const part = useVersePart({ popover, renderPopover, popoverProps })
  return (
    <Text
      {...props}
      {...part.attributes}
      className={cn(
        "underline decoration-muted-foreground/50 decoration-dotted underline-offset-4",
        part.active && "cursor-pointer",
        className
      )}
      role={part.active ? "button" : undefined}
      size={size ?? part.size}
      tabIndex={part.active ? 0 : undefined}
    />
  )
}

export function VerseNote({
  className,
  size,
  popover,
  renderPopover,
  popoverProps,
  ...props
}: TVerseNoteProps): ReactElement {
  const part = useVersePart({ popover, renderPopover, popoverProps })
  return (
    <Text
      {...props}
      {...part.attributes}
      className={cn("mx-0.5 text-[0.75em]", part.active && "cursor-pointer", className)}
      role={part.active ? "button" : undefined}
      size={size ?? part.size}
      tabIndex={part.active ? 0 : undefined}
      type="subscript"
    />
  )
}
