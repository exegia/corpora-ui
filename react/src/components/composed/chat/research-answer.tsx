"use client"

import { BookOpen, Calendar, Copy, ListPlus, Share2, Users } from "lucide-react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardFrame, CardFrameFooter, CardFrameHeader, CardPanel } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconTile, InlineSource } from "@/components/ui/chat"

export interface ResearchReference {
  /** Pill label, e.g. "Iliad · Homer corpus". */
  label: React.ReactNode
  /** Preview-card content shown on hover. */
  favicon?: string
  title?: React.ReactNode
  description?: React.ReactNode
  href?: string
}

export interface ResearchAnswerProps extends Omit<React.ComponentPropsWithoutRef<"div">, "content"> {
  kicker?: React.ReactNode
  /** "Answered from 3 passages · 0.8 s" */
  kickerSub?: React.ReactNode
  content: React.ReactNode
  source?: React.ReactNode | ResearchReference
  date?: React.ReactNode
  authors?: React.ReactNode | ResearchReference
  onCopyCitation?: () => void
  onShare?: () => void
  /** TODO(spec 003): the design shows the control only; behaviour is the caller's. */
  onAddToList?: () => void
  bare?: boolean
}

const GHOST = "h-6 gap-1.5 rounded-md px-2 text-[11.5px] font-medium text-text-secondary hover:bg-surface-subtle hover:text-text-primary sm:h-6 [&_svg]:size-3.5! [&_svg]:opacity-100"

/**
 * Research answer card: kicker, content, Source / Date / Author(s) meta, actions.
 *
 * @sketch "Component / Research Answer"
 */
export function ResearchAnswer({
  kicker = "Research answer", kickerSub, content, source, date, authors,
  onCopyCitation, onShare, onAddToList, bare = false, className, ...props
}: ResearchAnswerProps): React.ReactElement {
  // A structured value renders as a reference pill with a hover preview;
  // plain strings stay plain text.
  const asPill = (value: React.ReactNode): React.ReactNode => {
    if (value && typeof value === "object" && "label" in value) {
      const { label, ...preview } = value as ResearchReference
      return <InlineSource domain={label} {...preview} />
    }
    return value
  }
  const meta = [
    { icon: <BookOpen />, label: "Source", value: source },
    { icon: <Calendar />, label: "Date", value: date },
    { icon: <Users />, label: "Author(s)", value: authors },
  ].filter((m) => m.value !== undefined)

  return (
    <CardFrame
      data-slot="research-answer"
      className={cn("w-[380px] max-w-full [--frame-radius:var(--radius-md)]", bare && "border-transparent shadow-none", className)}
      {...props}
    >
      <CardFrameHeader className="flex flex-row items-start gap-2 px-3.5 py-3">
        <IconTile size={28}><BookOpen /></IconTile>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[13px] font-semibold leading-4 text-text-primary">{kicker}</span>
          {kickerSub ? <span className="text-[11px] leading-3 text-text-secondary">{kickerSub}</span> : null}
        </div>
      </CardFrameHeader>
      <Card>
      <CardPanel className="px-3.5 py-3.5 text-[13px] leading-[18px] text-text-primary">{content}</CardPanel>
      {meta.length ? (
        <>
          <div className="mx-3.5 h-px bg-border-default" />
          <dl className="flex flex-col gap-1.5 px-3.5 py-3">
            {meta.map((m) => (
              <div key={m.label} className="flex items-baseline gap-3">
                <dt className="flex w-20 shrink-0 items-center gap-1 text-[11px] leading-4 text-text-secondary [&_svg]:size-3 [&_svg]:self-center [&_svg]:text-icon">{m.icon}{m.label}</dt>
                <dd className="min-w-0 flex-1 text-[12px] leading-4 text-text-primary">{asPill(m.value)}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : null}
      </Card>
      <CardFrameFooter className="flex items-center gap-0.5 p-2">
        <Button variant="ghost" size="xs" className={GHOST} onClick={onCopyCitation}><Copy />Copy</Button>
        <Button variant="ghost" size="xs" className={GHOST} onClick={onShare}><Share2 />Share</Button>
        <Button variant="ghost" size="xs" className={GHOST} onClick={onAddToList}><ListPlus />Add to list</Button>
      </CardFrameFooter>
    </CardFrame>
  )
}
