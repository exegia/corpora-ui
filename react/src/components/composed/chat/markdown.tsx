"use client"

import { Copy, Maximize2 } from "lucide-react"
import * as React from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import { cn } from "@/lib/utils"
import { IconButton, SegmentedToggle } from "@/components/ui/chat"
import { markdownViewAtom, removeMarkdownInstance, type MarkdownView, useMarkdownView } from "./markdown-atom"

export { markdownViewAtom, removeMarkdownInstance, useMarkdownView, type MarkdownView }

const VIEWS = [{ value: "preview", label: "Preview" }, { value: "markup", label: "Markup" }] as const

/** Tag map restricted to what the design shows: headings, paragraphs, lists, inline + fenced code. */
const COMPONENTS: Components = {
  h1: ({ children }) => <h1 className="text-[15px] font-semibold leading-[17px] text-text-primary">{children}</h1>,
  h2: ({ children }) => <h2 className="text-[14px] font-semibold leading-4 text-text-primary">{children}</h2>,
  h3: ({ children }) => <h3 className="text-[13px] font-semibold leading-4 text-text-primary">{children}</h3>,
  p: ({ children }) => <p className="text-[13px] leading-[15px] text-text-primary">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  a: ({ children, href }) => <a className="text-link underline-offset-2 hover:underline" href={href} rel="noreferrer" target="_blank">{children}</a>,
  ul: ({ children }) => <ul className="flex list-disc flex-col gap-1 pl-4 text-[13px] leading-[15px] text-text-primary">{children}</ul>,
  ol: ({ children }) => <ol className="flex list-decimal flex-col gap-1 pl-4 text-[13px] leading-[15px] text-text-primary">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  code: ({ children, className }) =>
    className ? (
      <code className="font-mono text-[11.5px] leading-[14px] text-link">{children}</code>
    ) : (
      <code className="rounded-[4px] bg-surface-code px-1 py-px font-mono text-[11.5px] text-link">{children}</code>
    ),
  pre: ({ children }) => <pre className="overflow-x-auto rounded-lg bg-surface-code px-2.5 py-1.5">{children}</pre>,
}

export interface MarkdownProps extends Omit<React.ComponentPropsWithoutRef<"div">, "onCopy"> {
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
  source, markdownId, view, defaultView, onViewChange, onCopy, onExpand, bare = false, className, ...props
}: MarkdownProps): React.ReactElement {
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
    <div
      data-slot="markdown"
      data-view={current}
      className={cn("flex w-[360px] max-w-full flex-col rounded-xl bg-surface-card", !bare && "border border-border-default", className)}
      {...props}
    >
      <div className="flex items-center justify-between px-3 py-2.5">
        <SegmentedToggle label="Markdown view" options={VIEWS} value={current} onValueChange={select} />
        <span className="flex items-center gap-1">
          <IconButton aria-label="Expand" onClick={onExpand}><Maximize2 /></IconButton>
          <IconButton aria-label="Copy markdown" onClick={() => onCopy?.(source)}><Copy /></IconButton>
        </span>
      </div>
      <div className="h-px w-full bg-border-default" />
      {current === "preview" ? (
        <div className="flex flex-col gap-2.5 p-4">
          <ReactMarkdown components={COMPONENTS}>{source}</ReactMarkdown>
        </div>
      ) : (
        <pre className="m-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-surface-code px-2.5 py-2 font-mono text-[11px] leading-[13px] text-text-primary">{source}</pre>
      )}
    </div>
  )
}
