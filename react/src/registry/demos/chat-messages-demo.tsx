import * as React from "react"

import { DemoStage } from "@/components/docs/demo-controls"
import { Bubble } from "@/components/atoms"
import { Attachment } from "@/components/composed/chat"

export default function ChatMessagesDemo(): React.ReactElement {
  return (
    <DemoStage canvasClassName="flex min-h-24 w-full max-w-[480px] flex-col p-6">
      <Bubble variant="sender">
        <Bubble.Header name="Sender" time="10 min ago" />
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
    </DemoStage>
  )
}
