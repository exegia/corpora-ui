"use client"

import { Copy, Maximize2 } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { EASE_OUT } from "@/lib/ease"
import * as React from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import { cn } from "@/lib/utils"
import {
  Card,
  CardFrame,
  CardFrameHeader,
  CardPanel,
} from "@/components/ui/card"
import { IconButton } from "@/components/ui/chat"
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"
import {
  markdownViewAtom,
  removeMarkdownInstance,
  type MarkdownView,
  useMarkdownView,
} from "./markdown-atom"

export {
  markdownViewAtom,
  removeMarkdownInstance,
  useMarkdownView,
  type MarkdownView,
}

const VIEWS = [
  { value: "preview", label: "Preview" },
  { value: "markup", label: "Markup" },
] as const

/** Tag map restricted to what the design shows: headings, paragraphs, lists, inline + fenced code. */
const COMPONENTS: Components = {
  h1: ({ children }) => (
    <h1 className="text-[15px] leading-[17px] font-semibold text-text-primary">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-[14px] leading-4 font-semibold text-text-primary">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-[13px] leading-4 font-semibold text-text-primary">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-[13px] leading-[15px] text-text-primary">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  a: ({ children, href }) => (
    <a
      className="text-link underline-offset-2 hover:underline"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="flex list-disc flex-col gap-1 pl-4 text-[13px] leading-[15px] text-text-primary">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="flex list-decimal flex-col gap-1 pl-4 text-[13px] leading-[15px] text-text-primary">
      {children}
    </ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  code: ({ children, className }) =>
    className ? (
      <code className="font-mono text-[11.5px] leading-[14px] text-link">
        {children}
      </code>
    ) : (
      <code className="rounded-[4px] bg-surface-code px-1 py-px font-mono text-[11.5px] text-link">
        {children}
      </code>
    ),
  pre: ({ children }) => (
    <pre className="overflow-x-auto rounded-lg bg-surface-code px-2.5 py-1.5">
      {children}
    </pre>
  ),
}

export interface MarkdownProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "onCopy"
> {
  /** Markdown source; rendered in Preview, shown raw in Markup. */
  source: string
  /** Stable id for the view atom. Unnamed cards key off `useId()`. */
  markdownId?: string
  view?: MarkdownView
  defaultView?: MarkdownView
  onViewChange?: (view: MarkdownView) => void
  onCopy?: (source: string) => void
  onExpand?: () => void
  /** Drop the card border (inside an AiBubble the bubble supplies it). */
  bare?: boolean
}

/**
 * Rendered markdown behind a Preview | Markup toggle, with copy and expand.
 *
 * @sketch "Component / Markdown / Preview", "Component / Markdown / Markup"
 */
export function Markdown({
  source,
  markdownId,
  view,
  defaultView,
  onViewChange,
  onCopy,
  onExpand,
  bare = false,
  className,
  ...props
}: MarkdownProps): React.ReactElement {
  const reduceMotion = useReducedMotion()
  const generatedId = React.useId()
  const id = markdownId ?? generatedId
  const [stored, setStored] = useMarkdownView(id)
  React.useEffect(() => {
    if (markdownId) return
    return () => removeMarkdownInstance(id)
  }, [markdownId, id])

  const current: MarkdownView = view ?? stored ?? defaultView ?? "preview"
  const select = (next: MarkdownView) => {
    if (view === undefined) setStored(next)
    onViewChange?.(next)
  }

  return (
    <CardFrame
      data-slot="markdown"
      data-view={current}
      className={cn(
        "w-[360px] max-w-full [--frame-radius:var(--radius-md)]",
        bare && "border-transparent shadow-none",
        className,
        "rounded-md!"
      )}
      {...props}
    >
      <CardFrameHeader className="flex flex-row items-center justify-between rounded-md! px-3 py-2">
        <Tabs
          className="gap-0"
          value={current}
          onValueChange={(next) => select(next as MarkdownView)}
        >
          <TabsList aria-label="Markdown view" size="xs">
            {VIEWS.map((v) => (
              <TabsTab key={v.value} size="xs" value={v.value}>
                {v.label}
              </TabsTab>
            ))}
          </TabsList>
        </Tabs>
        <span className="flex items-center gap-1">
          <IconButton aria-label="Expand" onClick={onExpand}>
            <Maximize2 />
          </IconButton>
          <IconButton
            aria-label="Copy markdown"
            onClick={() => onCopy?.(source)}
          >
            <Copy />
          </IconButton>
        </span>
      </CardFrameHeader>
      <Card>
        <CardPanel className={current === "preview" ? "p-4" : "p-2"}>
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              key={current}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.24, ease: EASE_OUT }
              }
            >
              {current === "preview" ? (
                <div className="flex flex-col gap-2.5">
                  <ReactMarkdown components={COMPONENTS}>{source}</ReactMarkdown>
                </div>
              ) : (
                <pre className="overflow-x-auto rounded-md bg-surface-code px-2.5 py-2 font-mono text-[11px] leading-[13px] whitespace-pre-wrap text-text-primary">
                  {source}
                </pre>
              )}
            </motion.div>
          </AnimatePresence>
        </CardPanel>
      </Card>
    </CardFrame>
  )
}
