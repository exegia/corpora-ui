import * as React from "react"
import { LayoutGroup, motion, useReducedMotion } from "motion/react"

import { Bubble, Reference, type BubbleReaction } from "@/components/atoms"
import {
  AiMessage,
  Composer,
  SuggestedPrompt,
  SuggestionCard,
  UserMessage,
  type SuggestionState,
} from "@/components/composed/ai"
import { Button } from "@/components/ui/button"
import { DemoStage, DemoToggle } from "@/components/docs/demo-controls"

const QUESTION =
  "Can you check whether ¶12 keeps the RC003 boundary? The walker looks like it split it."

const PROMPTS = [
  { id: "rc003", text: "Does ¶12 still keep the RC003 boundary?" },
  { id: "labels", text: "Another suggestion based on current context" },
]

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
  const reduceMotion = useReducedMotion()
  const [streaming, setStreaming] = React.useState(false)
  const [prompts, setPrompts] = React.useState(PROMPTS)
  const [asked, setAsked] = React.useState<typeof PROMPTS>([])
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

  // Picking a prompt unmounts the row and mounts the bubble carrying the same
  // `layoutId`, so Motion flies the new bubble out of the row's box — the
  // bubble does the travelling, which keeps it clear of the panel's
  // `overflow-hidden` collapse wrapper.
  const ask = (prompt: (typeof PROMPTS)[number]): void => {
    setPrompts((rest) => rest.filter((item) => item.id !== prompt.id))
    setAsked((sent) => [...sent, prompt])
  }

  return (
    <DemoStage
      controls={
        <>
          <DemoToggle
            checked={streaming}
            label="streaming"
            onChange={setStreaming}
          />
          <Button
            disabled={asked.length === 0}
            onClick={() => {
              setAsked([])
              setPrompts(PROMPTS)
            }}
            size="sm"
            variant="ghost"
          >
            Reset prompts
          </Button>
        </>
      }
    >
      <LayoutGroup>
        <div className="mx-auto grid w-full max-w-md gap-5 py-4">
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
                  reference={
                    <Reference href="#p-17">Book:rc003/word8</Reference>
                  }
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
                  reference={
                    <Reference href="#p-17">Book:rc003/word8</Reference>
                  }
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

          {asked.map((prompt) => (
            <motion.div
              key={prompt.id}
              layoutId={reduceMotion ? undefined : `suggested-${prompt.id}`}
            >
              <UserMessage author="Sender" time="just now">
                {prompt.text}
              </UserMessage>
            </motion.div>
          ))}

          <Composer
            onAttach={() => {}}
            onSend={() => {}}
            suggestedPrompts={prompts.map((prompt) => (
              <SuggestedPrompt
                key={prompt.id}
                layoutId={`suggested-${prompt.id}`}
                onSelect={() => ask(prompt)}
              >
                {prompt.text}
              </SuggestedPrompt>
            ))}
          />
        </div>
      </LayoutGroup>
    </DemoStage>
  )
}
