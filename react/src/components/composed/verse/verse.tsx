"use client"

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import type { ReactElement, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Text } from "@/components/atoms/text/default"
import { AnchoredPopover, useAnchoredPopover } from "@/components/atoms/text/selection"
import type { IUseAnchoredPopoverResult, ITextPopoverRenderProps } from "@/components/atoms/text/selection"
import type { TTextSize } from "@/components/atoms/text/type"
import type { IVersePopoverProps, IVerseProps, TVerseNoteProps, TVerseSpanProps } from "./type"

/**
 * Where verse parts put their popover content, keyed by a `useId()`; the
 * popover payload is that key. A tiny external store rather than React state:
 * parts register from layout effects with an inline `popover` element that is
 * a new identity every render, so setState here would loop — instead only the
 * leaf that renders the popup subscribes, through `useSyncExternalStore`.
 */
interface IVerseRegistry {
  entries: Map<string, IVersePopoverProps>
  version: number
  listeners: Set<() => void>
  subscribe: (listener: () => void) => () => void
  getVersion: () => number
  set: (key: string, entry: IVersePopoverProps) => void
  delete: (key: string) => void
}

function createVerseRegistry(): IVerseRegistry {
  const registry: IVerseRegistry = {
    entries: new Map(),
    version: 0,
    listeners: new Set(),
    subscribe(listener) {
      registry.listeners.add(listener)
      return () => {
        registry.listeners.delete(listener)
      }
    },
    getVersion: () => registry.version,
    set(key, entry) {
      registry.entries.set(key, entry)
      registry.version += 1
      for (const listener of registry.listeners) listener()
    },
    delete(key) {
      registry.entries.delete(key)
      registry.version += 1
      for (const listener of registry.listeners) listener()
    },
  }
  return registry
}

interface IVerseContextValue {
  size?: TTextSize
  openKey: string | null
  /** Publish (or update) a part's content. */
  register: (key: string, entry: IVersePopoverProps) => void
  /** Forget a part; closes the popover if that part was the one open. */
  unregister: (key: string) => void
}

const VerseContext = createContext<IVerseContextValue>({
  openKey: null,
  register: () => {},
  unregister: () => {},
})

const chapterClassName = "mr-1.5 align-super text-[0.7em] font-medium no-underline hover:underline"

function hasContent(entry: IVersePopoverProps): boolean {
  return entry.renderPopover !== undefined || (entry.popover !== undefined && entry.popover !== null)
}

/** Registers a part's popover content and returns the attributes that make it a target. */
function useVersePart(entry: IVersePopoverProps) {
  const { size, openKey, register, unregister } = useContext(VerseContext)
  const key = useId()
  const active = hasContent(entry)
  const { popover, renderPopover, popoverProps } = entry
  // Content updates re-publish without unregistering, so an inline `popover`
  // element (a new identity every render) never closes an open popup.
  useLayoutEffect(() => {
    if (active) register(key, { popover, renderPopover, popoverProps })
    else unregister(key)
  }, [active, key, popover, popoverProps, register, renderPopover, unregister])
  useLayoutEffect(() => () => unregister(key), [key, unregister])
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

/**
 * The one popup of a verse. It alone subscribes to the registry, so content
 * that changes while open re-renders here without touching the verse.
 */
function VersePopup({
  registry,
  openKey,
  popover,
}: {
  registry: IVerseRegistry
  openKey: string | null
  popover: IUseAnchoredPopoverResult<string>
}): ReactElement {
  useSyncExternalStore(registry.subscribe, registry.getVersion, registry.getVersion)
  const entry = openKey ? registry.entries.get(openKey) : undefined
  return (
    <AnchoredPopover {...popover.popoverProps} {...entry?.popoverProps}>
      {(renderProps) => renderVerseEntry(entry, renderProps)}
    </AnchoredPopover>
  )
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
  const [registry] = useState(createVerseRegistry)
  const popover = useAnchoredPopover<string>({
    ref,
    trigger: "click",
    match: "[data-verse-popover]",
    getPayload: ({ target }) => target?.getAttribute("data-verse-popover") ?? "",
  })

  const openKey = popover.open ? (popover.payload ?? null) : null
  // The unregister path reads the current open key through a ref: a part
  // that unmounts while its popover is open must close it, or the popup
  // would outlive its anchor.
  const openKeyRef = useRef(openKey)
  const hideRef = useRef(popover.hide)
  useLayoutEffect(() => {
    openKeyRef.current = openKey
    hideRef.current = popover.hide
  })

  const register = useCallback(
    (key: string, entry: IVersePopoverProps) => {
      registry.set(key, entry)
    },
    [registry]
  )
  const unregister = useCallback(
    (key: string) => {
      if (!registry.entries.has(key)) return
      registry.delete(key)
      if (openKeyRef.current === key) hideRef.current()
    },
    [registry]
  )

  const context = useMemo<IVerseContextValue>(
    () => ({ size, openKey, register, unregister }),
    [size, openKey, register, unregister]
  )

  const chapterKey = useId()
  const chapterActive = hasContent({ popover: chapterPopover, renderPopover: renderChapterPopover })
  useLayoutEffect(() => {
    if (chapterActive) register(chapterKey, { popover: chapterPopover, renderPopover: renderChapterPopover })
    else unregister(chapterKey)
  }, [chapterActive, chapterKey, chapterPopover, register, renderChapterPopover, unregister])

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
      <VersePopup openKey={openKey} popover={popover} registry={registry} />
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
      role={part.active ? "button" : props.role}
      size={size ?? part.size}
      tabIndex={part.active ? 0 : props.tabIndex}
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
      role={part.active ? "button" : props.role}
      size={size ?? part.size}
      tabIndex={part.active ? 0 : props.tabIndex}
      type="subscript"
    />
  )
}
