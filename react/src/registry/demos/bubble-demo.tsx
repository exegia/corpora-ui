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
  sender: "Validate this passage against the schema.",
  recipient: "Sounds good — I'll take a look at p-17 today.",
  ai: "The paragraph boundary is valid. Node p-17 has a label mismatch — accept the suggested fix to align it with the schema.",
}

export default function BubbleDemo(): React.ReactElement {
  const [variant, setVariant] =
    React.useState<(typeof VARIANTS)[number]>("sender")
  const [withReactions, setWithReactions] = React.useState(true)
  const [withActions, setWithActions] = React.useState(true)
  const [reactions, setReactions] = React.useState<BubbleReaction[]>([
    { emoji: "👍", count: 2, reacted: true, label: "thumbs up" },
    { emoji: "🎯", count: 1, label: "on target" },
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
          <Bubble.Message>{COPY[variant]}</Bubble.Message>
          {withReactions && (
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
