import * as React from "react"

import { DemoStage } from "@/components/docs/demo-controls"
import { Attachment } from "@/components/composed/chat"
import { MessageRecipient, MessageSender } from "@/components/blocks/chat"

export default function ChatMessagesDemo(): React.ReactElement {
  return (
    <DemoStage canvasClassName="flex min-h-24 w-full max-w-[420px] flex-col gap-4 p-6">
      <MessageSender attachment={<Attachment kind="document" variant="preview" title="Q3-financial-report.pdf" meta="PDF · 2.4 MB · 12 pages" onAction={() => {}} />}>
        Here’s the Q3 report — can you check §4 against the walker output before Thursday?
      </MessageSender>
      <MessageRecipient
        name="Recipient"
        time="5 min ago"
        attachment={<Attachment kind="text-selection" variant="preview" title="Iliad · Book 1, §12" quote="“…the will of Zeus was accomplished, from the time when first they parted in strife, Atreus’ son and godlike Achilles.”" />}
      >
        Sure — the source passage is here. ¶12 stays inside the RC003 boundary:
      </MessageRecipient>
    </DemoStage>
  )
}
