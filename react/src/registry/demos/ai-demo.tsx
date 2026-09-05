import * as React from "react"

import { Bubble, type BubbleReaction } from "@/components/atoms"
import {
  AiMessage,
  Composer,
  ReferenceChip,
  SuggestionCard,
  UserMessage,
  type SuggestionState,
} from "@/components/composed/ai"
import { DemoStage, DemoToggle } from "@/components/docs/demo-controls"

const QUESTION =
  "Can you check whether ¶12 keeps the RC003 boundary? The walker looks like it split it."

function useReactions(
  initial: BubbleReaction[]
): [BubbleReaction[], (reaction: BubbleReaction, index: number) => void] {
  const [reactions, setReactions] = React.useState(initial)
  const toggle = (_: BubbleReaction, index: number): void =>
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
  return [reactions, toggle]
}

export default function AiDemo(): React.ReactElement {
  const [streaming, setStreaming] = React.useState(false)
  const [first, setFirst] = React.useState<SuggestionState>("accepted")
  const [second, setSecond] = React.useState<SuggestionState>("pending")
  const [senderReactions, toggleSender] = useReactions([
    { id: "heart", emoji: "❤️", count: 4, reacted: true, label: "heart" },
    { id: "thumbs", emoji: "👍", count: 2, label: "thumbs up" },
  ])
  const [recipientReactions, toggleRecipient] = useReactions([
    { id: "heart", emoji: "❤️", count: 4, label: "heart" },
    { id: "thumbs", emoji: "👍", count: 2, reacted: true, label: "thumbs up" },
  ])

  return (
    <DemoStage
      controls={
        <DemoToggle
          checked={streaming}
          label="streaming"
          onChange={setStreaming}
        />
      }
    >
      <div className="mx-auto grid w-full max-w-md gap-5">
        <UserMessage
          author="Sender"
          badge="Admin"
          onReactionToggle={toggleSender}
          reactions={senderReactions}
          time="10 min ago"
        >
          {QUESTION}
        </UserMessage>

        <Bubble variant="recipient">
          <Bubble.Header name="Recipient" time="5 min ago" />
          <Bubble.Message>{QUESTION}</Bubble.Message>
          <Bubble.Reactions
            onToggle={toggleRecipient}
            reactions={recipientReactions}
          />
        </Bubble>

        <AiMessage
          author="Exegia"
          defaultSuggestionsOpen
          isStreaming={streaming}
          onStop={() => setStreaming(false)}
          suggestions={
            <>
              <SuggestionCard
                defaultOpen={false}
                description="Label mismatch on p-17"
                heading="Suggestion"
                key="p-17"
                nodeId="p-17"
                onAccept={() => setFirst("accepted")}
                onReject={() => setFirst("rejected")}
                reference={<ReferenceChip href="#p-17">Reference 1</ReferenceChip>}
                state={first}
              >
                The canonical paragraph label is required by the schema.
              </SuggestionCard>
              <SuggestionCard
                description="Boundary drift on p-18"
                heading="Suggestion"
                key="p-18"
                nodeId="p-18"
                onAccept={() => setSecond("accepted")}
                onReject={() => setSecond("rejected")}
                reference={<ReferenceChip href="#p-18">Reference 1</ReferenceChip>}
                state={second}
              >
                Scanned 30,102 nodes in a.1. Two boundary defects and one
                missing case feature. Nothing here needs a walker re-run.
              </SuggestionCard>
            </>
          }
          time="2 min ago"
        >
          ¶12 keeps the RC003 boundary — the walker split the rendering, not
          the node. Two labels drifted from the schema while it ran; both
          fixes are below.
        </AiMessage>

        <Composer onAttach={() => {}} onSend={() => {}} />
      </div>
    </DemoStage>
  )
}
