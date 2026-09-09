"use client"

import { Copy, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react"
import { useAtom } from "jotai"
import { motion, useReducedMotion } from "motion/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { createKeyedFamilies } from "@/lib/keyed-atom"
import { AvatarStack, Favicon, FollowUpRow, IconButton, SourceChip } from "@/components/ui/chat"

const { stateFamily, removeInstance } = createKeyedFamilies("streaming")

/** Whether the sources panel is open, keyed by `streamingId`. */
export const streamingSourcesOpenAtom = stateFamily<boolean>("sourcesOpen", false)
export const removeStreamingInstance = removeInstance

/** A word, or an inline citation chip. */
export type StreamingToken = { text: string } | { cite: string; favicon?: string }

export interface StreamingSource {
  name: React.ReactNode
  domain: React.ReactNode
  favicon?: string
  href?: string
}

export interface StreamingTextProps extends Omit<React.ComponentPropsWithoutRef<"div">, "onCopy"> {
  /** Stable id for the sources-panel atom. */
  streamingId?: string
  /** Paragraphs, each a token list; a string is split on spaces. */
  paragraphs: (string | StreamingToken[])[]
  /** Reveal words over time and show the caret. */
  streaming?: boolean
  wordMs?: number
  sources?: StreamingSource[]
  sourcesLabel?: React.ReactNode
  followUps?: string[]
  onFollowUp?: (text: string) => void
  onCopy?: () => void
  onRegenerate?: () => void
  onFeedback?: (vote: "up" | "down") => void
}

const toTokens = (p: string | StreamingToken[]): StreamingToken[] => (typeof p === "string" ? p.split(" ").map((text) => ({ text })) : p)

/**
 * Streamed answer: paragraphs with inline source chips and a caret, an action
 * row, a collapsible sources panel and follow-up prompts.
 *
 * @sketch "Component / Streaming Text"
 */
export function StreamingText({
  streamingId, paragraphs, streaming = false, wordMs = 55, sources = [], sourcesLabel, followUps = [],
  onFollowUp, onCopy, onRegenerate, onFeedback, className, ...props
}: StreamingTextProps): React.ReactElement {
  const generatedId = React.useId()
  const id = streamingId ?? generatedId
  const [open, setOpen] = useAtom(streamingSourcesOpenAtom(id))
  const reduceMotion = useReducedMotion()
  const tokens = React.useMemo(() => paragraphs.map(toTokens), [paragraphs])
  const total = tokens.reduce((n, p) => n + p.length, 0)
  // Revealed-word counter; a change in `total` resets it during render (the
  // React "adjust state on prop change" pattern), and only the interval
  // advances it, so no effect ever sets state synchronously.
  const [reveal, setReveal] = React.useState({ total, n: 0 })
  if (reveal.total !== total) setReveal({ total, n: 0 })
  const animate = streaming && !reduceMotion
  const shown = animate ? Math.min(reveal.n, total) : total

  React.useEffect(() => {
    if (!animate) return
    const timer = setInterval(() => setReveal((r) => (r.n >= r.total ? r : { ...r, n: r.n + 1 })), wordMs)
    return () => clearInterval(timer)
  }, [animate, wordMs, total])

  React.useEffect(() => {
    if (streamingId) return
    return () => removeStreamingInstance(id)
  }, [streamingId, id])

  const done = shown >= total
  let cursor = 0

  return (
    <div data-slot="streaming-text" data-streaming={streaming && !done} className={cn("flex w-[380px] max-w-full flex-col gap-4", className)} {...props}>
      <div className="flex flex-col gap-1.5">
        {tokens.map((p, pi) => (
          <p key={pi} className="text-[13px] leading-[15px] text-text-primary">
            {p.map((t, ti) => {
              const index = cursor++
              const visible = index < shown
              const last = index === shown - 1 && streaming && !done
              return (
                <React.Fragment key={ti}>
                  {"cite" in t ? (
                    <motion.span initial={reduceMotion ? false : { opacity: 0, filter: "blur(4px)" }} animate={visible ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0 }} className="inline">
                      <SourceChip favicon={t.favicon}>{t.cite}</SourceChip>{" "}
                    </motion.span>
                  ) : (
                    <motion.span initial={reduceMotion ? false : { opacity: 0, filter: "blur(4px)" }} animate={visible ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0 }} className="inline">
                      {t.text}{" "}
                    </motion.span>
                  )}
                  {last ? <span aria-hidden="true" className="ml-px inline-block h-3 w-0.5 animate-pulse bg-text-primary align-middle" /> : null}
                </React.Fragment>
              )
            })}
          </p>
        ))}
      </div>

      <div className="flex items-center gap-0.5">
        <IconButton aria-label="Copy" onClick={onCopy}><Copy /></IconButton>
        <IconButton aria-label="Regenerate" onClick={onRegenerate}><RefreshCw /></IconButton>
        <IconButton aria-label="Helpful" onClick={() => onFeedback?.("up")}><ThumbsUp /></IconButton>
        <IconButton aria-label="Not helpful" onClick={() => onFeedback?.("down")}><ThumbsDown /></IconButton>
        {sources.length ? (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="ml-2.5 flex h-6 items-center gap-2 rounded-md px-1 text-[12.5px] text-text-secondary outline-none hover:text-text-primary focus-visible:ring-2 focus-visible:ring-ring"
          >
            <AvatarStack />
            {sourcesLabel ?? `${sources.length} sources`}
          </button>
        ) : null}
      </div>

      {sources.length && open ? (
        <ul data-slot="sources-panel" className="flex flex-col gap-2.5 rounded-[10px] bg-surface-subtle px-2.5 py-2.5">
          {sources.map((s, i) => (
            <li key={i} className="flex items-center gap-2 text-[12.5px] leading-4">
              <Favicon src={s.favicon} />
              {s.href ? <a className="text-text-primary hover:underline" href={s.href} rel="noreferrer" target="_blank">{s.name}</a> : <span className="text-text-primary">{s.name}</span>}
              <span className="font-mono text-[11px] text-text-secondary">{s.domain}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {followUps.length ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold leading-3 text-text-secondary">Follow-ups</span>
          <div className="flex flex-col">
            {followUps.map((f) => <FollowUpRow key={f} onSelect={() => onFollowUp?.(f)}>{f}</FollowUpRow>)}
          </div>
        </div>
      ) : null}
    </div>
  )
}
