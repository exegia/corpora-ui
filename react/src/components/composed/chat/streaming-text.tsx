"use client"

import { useReducedMotion } from "motion/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { InlineSource } from "@/components/ui/chat"

/** A word, or an inline citation; extra fields turn the chip into a hover preview. */
export type StreamingToken =
  | { text: string }
  | { cite: string; favicon?: string; title?: string; description?: string; href?: string }

export interface StreamingTextProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Paragraphs, each a token list; a string is split on spaces. */
  paragraphs: (string | StreamingToken[])[]
  /** Reveal words over time and show the caret. */
  streaming?: boolean
  wordMs?: number
}

const toTokens = (p: string | StreamingToken[]): StreamingToken[] => (typeof p === "string" ? p.split(" ").map((text) => ({ text })) : p)

/**
 * Streamed answer: paragraphs with inline source previews and a caret.
 * Actions, sources and follow-ups belong to the host.
 *
 * @sketch "Component / Streaming Text"
 */
export function StreamingText({
  paragraphs, streaming = false, wordMs = 55, className, ...props
}: StreamingTextProps): React.ReactElement {
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

  const done = shown >= total
  let cursor = 0
  // Plain CSS transitions: each word fades in once and never re-animates on
  // re-render, which is what kept the Motion version flickering.
  const word = (visible: boolean) =>
    cn("inline transition-opacity duration-300 ease-[var(--ease-out-strong)]", !reduceMotion && !visible && "opacity-0")

  return (
    <div data-slot="streaming-text" data-streaming={streaming && !done} className={cn("flex w-[380px] max-w-full flex-col", className)} {...props}>
      {tokens.map((p, pi) => (
        <p key={pi} className="text-[13px] leading-5 text-text-primary">
          {p.map((t, ti) => {
            const index = cursor++
            const visible = index < shown
            const last = index === shown - 1 && streaming && !done
            return (
              <React.Fragment key={ti}>
                <span className={word(visible)}>
                  {"cite" in t ? (
                    <InlineSource domain={t.cite} favicon={t.favicon} title={t.title} description={t.description} href={t.href} />
                  ) : (
                    t.text
                  )}{" "}
                </span>
                {last ? <span aria-hidden="true" className="ml-px inline-block h-3.5 w-0.5 animate-pulse bg-text-primary align-middle" /> : null}
              </React.Fragment>
            )
          })}
        </p>
      ))}
    </div>
  )
}
