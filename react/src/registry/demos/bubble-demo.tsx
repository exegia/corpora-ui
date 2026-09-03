import * as React from "react"
import { CopyIcon, PencilIcon, RotateCcwIcon } from "lucide-react"

import {
  Bubble,
  type BubbleReaction,
  type BubbleVariant,
} from "@/components/atoms"
import { Button } from "@/components/ui/button"
import {
  DemoSelect,
  DemoStage,
  DemoToggle,
} from "@/components/docs/demo-controls"

const VARIANTS = ["sender", "recipient", "ai"] as const

const COPY: Record<BubbleVariant, string> = {
  sender:
    "Can you check whether ¶12 keeps the RC003 boundary? The walker looks like it split it.",
  recipient: "Sounds good — I'll take a look at ¶12 today.",
  ai: "The paragraph boundary is valid. Node p-17 has a label mismatch — accept the suggested fix to align it with the schema.",
}

const HEADER: Record<
  BubbleVariant,
  { name: string; time: string; badge?: string }
> = {
  sender: { name: "Sender", time: "10 min ago", badge: "Admin" },
  recipient: { name: "Recipient", time: "5 min ago" },
  ai: { name: "Exegia", time: "2 min ago", badge: "Agent" },
}

export default function BubbleDemo(): React.ReactElement {
  const [variant, setVariant] =
    React.useState<(typeof VARIANTS)[number]>("sender")
  const [withHeader, setWithHeader] = React.useState(true)
  const [withReactions, setWithReactions] = React.useState(true)
  const [withActions, setWithActions] = React.useState(false)
  const [reactions, setReactions] = React.useState<BubbleReaction[]>([
    { id: "heart", emoji: "❤️", count: 4, reacted: true, label: "heart" },
    { id: "thumbs", emoji: "👍", count: 2, label: "thumbs up" },
  ])

  const toggleReaction = (_: BubbleReaction, index: number): void =>
    setReactions((previous) =>
      previous.map((reaction, at) =>
        at === index
          ? {
              ...reaction,
              reacted: !reaction.reacted,
              count: (reaction.count ?? 0) + (reaction.reacted ? -1 : 1),
            }
          : reaction
      )
    )

  return (
    <DemoStage
      controls={
        <>
          <DemoSelect
            label="variant"
            onChange={setVariant}
            options={VARIANTS}
            value={variant}
          />
          <DemoToggle
            checked={withHeader}
            label="header"
            onChange={setWithHeader}
          />
          <DemoToggle
            checked={withReactions}
            label="reactions"
            onChange={setWithReactions}
          />
          <DemoToggle
            checked={withActions}
            label="actions"
            onChange={setWithActions}
          />
        </>
      }
    >
      <div className="mx-auto w-full max-w-sm">
        <Bubble variant={variant}>
          {withHeader && (
            <Bubble.Header
              badge={HEADER[variant].badge}
              name={HEADER[variant].name}
              time={HEADER[variant].time}
            />
          )}
          <Bubble.Message>{COPY[variant]}</Bubble.Message>
          {withReactions && variant !== "ai" && (
            <Bubble.Reactions onToggle={toggleReaction} reactions={reactions} />
          )}
          {withActions && (
            <Bubble.Actions>
              <Button aria-label="Copy" size="icon-xs" variant="ghost">
                <CopyIcon />
              </Button>
              <Button aria-label="Edit" size="icon-xs" variant="ghost">
                <PencilIcon />
              </Button>
              <Button aria-label="Retry" size="icon-xs" variant="ghost">
                <RotateCcwIcon />
              </Button>
            </Bubble.Actions>
          )}
        </Bubble>
      </div>
    </DemoStage>
  )
}
