import * as React from "react"

import { DemoSelect, DemoStage } from "@/components/docs/demo-controls"
import { Attachment, type AttachmentVariant } from "@/components/composed/chat"

const VARIANTS = ["default", "preview"] as const

export default function AttachmentDemo(): React.ReactElement {
  const [variant, setVariant] = React.useState<AttachmentVariant>("default")
  const remove = () => {}
  return (
    <DemoStage
      canvasClassName="flex min-h-24 w-full flex-wrap items-start justify-center gap-4 p-6"
      controls={<DemoSelect label="variant" options={VARIANTS} value={variant} onChange={setVariant} />}
    >
      <Attachment kind="document" variant={variant} title="Q3-financial-report.pdf" meta={variant === "default" ? "PDF · 2.4 MB" : "PDF · 2.4 MB · 12 pages"} onRemove={remove} onAction={() => {}} />
      <Attachment kind="image" variant={variant} title="IMG_2048.jpg" meta="JPG · 1.2 MB · 4032×3024" onRemove={remove} />
      <Attachment kind="media" variant={variant} title="walker-run-demo.mp4" meta="MP4 · 0:42 · 18.6 MB" duration="0:42" onRemove={remove} />
      {variant === "preview" ? <Attachment kind="media" variant="preview" audio title="voice-note.m4a" meta="0:42 · voice-note.m4a" /> : null}
      <Attachment kind="text-selection" variant={variant} title="Iliad · Book 1, §12" meta="Corpus selection · 42 words" quote="“…the will of Zeus was accomplished, from the time when first they parted in strife, Atreus’ son and godlike Achilles.”" onRemove={remove} />
      <Attachment kind="chat-reply" variant={variant} title="Replying to Recipient" meta="Can you check whether ¶12…" author="Recipient" time="10 min ago" body="Can you check whether ¶12 keeps the RC003 boundary? The walker looks like it split it." onRemove={remove} />
      <Attachment kind="username-handle" variant={variant} title="@emmanuel" meta="Emmanuel De Freitas · Admin" initials="ED" onRemove={remove} />
      <Attachment kind="url-link" variant={variant} title={variant === "default" ? "sketch.com/s/0194…" : "Exegia UI — Chat UI canvas"} meta="Link · fetching preview" domain="sketch.com" description="Chat UI atoms, components and blocks for the Corpora assistant panel." onRemove={remove} />
    </DemoStage>
  )
}
