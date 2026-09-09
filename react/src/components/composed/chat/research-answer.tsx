"use client"

import { BookOpen, Calendar, Copy, ListPlus, Share2, ThumbsDown, ThumbsUp, Users } from "lucide-react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { IconButton, IconTile, Pill } from "@/components/ui/chat"

export interface ResearchAnswerProps extends Omit<React.ComponentPropsWithoutRef<"div">, "content"> {
  kicker?: React.ReactNode
  /** "Answered from 3 passages · 0.8 s" */
  kickerSub?: React.ReactNode
  /** Corpus pill, top-right ("Iliad"). */
  corpus?: React.ReactNode
  content: React.ReactNode
  source?: React.ReactNode
  date?: React.ReactNode
  authors?: React.ReactNode
  onCopyCitation?: () => void
  onShare?: () => void
  /** TODO(spec 003): the design shows the control only; behaviour is the caller's. */
  onAddToList?: () => void
  onFeedback?: (vote: "up" | "down") => void
  bare?: boolean
}

const GHOST = "h-6 gap-1.5 rounded-md px-2 text-[11.5px] font-medium text-text-secondary hover:bg-surface-subtle hover:text-text-primary sm:h-6 [&_svg]:size-3.5! [&_svg]:opacity-100"

/**
 * Research answer card: kicker, content, Source / Date / Author(s) meta, actions.
 *
 * @sketch "Component / Research Answer"
 */
export function ResearchAnswer({
  kicker = "Research answer", kickerSub, corpus, content, source, date, authors,
  onCopyCitation, onShare, onAddToList, onFeedback, bare = false, className, ...props
}: ResearchAnswerProps): React.ReactElement {
  const meta = [
    { icon: <BookOpen />, label: "Source", value: source },
    { icon: <Calendar />, label: "Date", value: date },
    { icon: <Users />, label: "Author(s)", value: authors },
  ].filter((m) => m.value !== undefined)

  return (
    <div
      data-slot="research-answer"
      className={cn("flex w-[380px] max-w-full flex-col rounded-xl bg-surface-card", !bare && "border border-border-default", className)}
      {...props}
    >
      <div className="flex items-start gap-2 px-3.5 pt-3">
        <IconTile size={28}><BookOpen /></IconTile>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[13px] font-semibold leading-4 text-text-primary">{kicker}</span>
          {kickerSub ? <span className="text-[11px] leading-3 text-text-secondary">{kickerSub}</span> : null}
        </div>
        {corpus ? <Pill>{corpus}</Pill> : null}
      </div>
      <div className="px-3.5 pb-3.5 pt-3 text-[13px] leading-[15px] text-text-primary">{content}</div>
      {meta.length ? (
        <>
          <div className="mx-3.5 h-px bg-border-default" />
          <div className="grid grid-cols-3 gap-2.5 px-3.5 py-3">
            {meta.map((m) => (
              <div key={m.label} className="flex min-w-0 flex-col gap-1">
                <span className="flex items-center gap-1 text-[11px] leading-3 text-text-secondary [&_svg]:size-3 [&_svg]:text-icon">{m.icon}{m.label}</span>
                <span className="text-[12px] leading-4 text-text-primary">{m.value}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}
      <div className="h-px w-full bg-border-default" />
      <div className="flex items-center gap-0.5 p-2">
        <Button variant="ghost" size="xs" className={GHOST} onClick={onCopyCitation}><Copy />Copy citation</Button>
        <Button variant="ghost" size="xs" className={GHOST} onClick={onShare}><Share2 />Share</Button>
        <Button variant="ghost" size="xs" className={GHOST} onClick={onAddToList}><ListPlus />Add to list</Button>
        <span className="ml-auto flex items-center gap-0.5">
          <IconButton aria-label="Helpful" onClick={() => onFeedback?.("up")}><ThumbsUp /></IconButton>
          <IconButton aria-label="Not helpful" onClick={() => onFeedback?.("down")}><ThumbsDown /></IconButton>
        </span>
      </div>
    </div>
  )
}
