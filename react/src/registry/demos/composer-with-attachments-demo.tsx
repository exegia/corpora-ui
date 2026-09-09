import * as React from "react"

import { DemoStage } from "@/components/docs/demo-controls"
import { ComposerWithAttachments, type ComposerAttachment } from "@/components/blocks/chat"

const SEED: ComposerAttachment[] = [
  { id: "pdf", kind: "document", title: "Q3-financial-report.pdf", meta: "PDF · 2.4 MB" },
  { id: "img", kind: "image", title: "IMG_2048.jpg", meta: "JPG · 1.2 MB · 4032×3024" },
]

export default function ComposerWithAttachmentsDemo(): React.ReactElement {
  const [sent, setSent] = React.useState<string | null>(null)
  return (
    <DemoStage canvasClassName="flex min-h-24 w-full flex-col items-center gap-3 p-6">
      <ComposerWithAttachments
        composerId="demo"
        defaultAttachments={SEED}
        defaultValue="Look at the context fabric api to validate the nodes."
        onSend={(draft, attachments) => setSent(`${draft} (+${attachments.length})`)}
      />
      {sent ? <p className="text-xs text-muted-foreground">Sent: {sent}</p> : null}
    </DemoStage>
  )
}
