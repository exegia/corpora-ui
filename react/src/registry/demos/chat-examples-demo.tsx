import * as React from "react"

import { AiBubble } from "@/components/blocks/chat"
import { Bubble } from "@/components/atoms"
import { Attachment } from "@/components/composed/chat"

/** Example 1 — plain sender/receiver exchange. */
export function SimpleChatExample(): React.ReactElement {
  return (
    <div className="flex w-full flex-col rounded-lg border border-border-default bg-background/40 p-6">
      <Bubble variant="sender">
        <Bubble.Header name="You" time="10 min ago" />
        <Bubble.Message>Here’s the Q3 report.</Bubble.Message>
      </Bubble>
      <Bubble variant="sender" continued>
        <Bubble.Message>Can you check §4 against the walker output before Thursday?</Bubble.Message>
      </Bubble>
      <Bubble variant="recipient">
        <Bubble.Header name="Researcher" time="5 min ago" />
        <Bubble.Message>Sure — pulling the passage now.</Bubble.Message>
      </Bubble>
    </div>
  )
}

/** Example 2 — document above the sender bubble, quoted passage inside the recipient bubble. */
export function AttachmentsChatExample(): React.ReactElement {
  return (
    <div className="flex w-full flex-col rounded-lg border border-border-default bg-background/40 p-6">
      <Bubble variant="sender">
        <Bubble.Header name="You" time="10 min ago" />
        <Attachment kind="document" variant="preview" title="Q3-financial-report.pdf" meta="PDF · 2.4 MB · 12 pages" onAction={() => {}} />
        <Bubble.Message>Here’s the Q3 report.</Bubble.Message>
      </Bubble>
      <Bubble variant="sender" continued>
        <Bubble.Message>Can you check §4 against the walker output before Thursday?</Bubble.Message>
      </Bubble>
      <Bubble variant="recipient">
        <Bubble.Header name="Recipient" time="5 min ago" />
        <Bubble.Message className="flex flex-col gap-2 text-left">
          Sure — the source passage is here. ¶12 stays inside the RC003 boundary:
          <Attachment kind="text-selection" variant="preview" title="Iliad · Book 1, §12" quote="“…the will of Zeus was accomplished, from the time when first they parted in strife, Atreus’ son and godlike Achilles.”" />
        </Bubble.Message>
      </Bubble>
    </div>
  )
}

/** Example 3 — AiBubble agent reply with a markdown content card. */
export function AiChatExample(): React.ReactElement {
  return (
    <div className="flex w-full flex-col rounded-lg border border-border-default bg-background/40 p-6">
      <AiBubble
        time="2 min ago"
        content={{
          kind: "markdown",
          markdownId: "chat-examples-ai",
          source: "## Boundary check — ¶12\n\nThe walker keeps ¶12 inside **RC003**. Two defects were found in the sub-tree and one case feature is missing.",
        }}
      />
    </div>
  )
}
