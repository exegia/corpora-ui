import * as React from "react"

import { BarChart3, Globe, Layers, Paperclip } from "lucide-react"

import { DemoStage } from "@/components/docs/demo-controls"
import { Composer, type ComposerAttachment } from "@/components/composed/ai"
import type { MenuCommandItem } from "@/components/ui/menu-command"

const COMMANDS: MenuCommandItem[] = [
  { id: "upload", label: "Add photos & files", description: "Upload from your computer", icon: <Paperclip /> },
  { id: "scoop", label: "Scoop Data", description: "Sales & churn metrics", icon: <BarChart3 /> },
  { id: "flavors", label: "Flavor records", description: "26 makers, tags, links", icon: <Layers /> },
  { id: "web", label: "Web search", description: "Real-time news and info", icon: <Globe />, trailing: "Connected" },
]

const SEED: ComposerAttachment[] = [
  { id: "pdf", kind: "document", title: "Q3-financial-report.pdf", meta: "PDF · 2.4 MB" },
  { id: "img", kind: "image", title: "IMG_2048.jpg", meta: "JPG · 1.2 MB · 4032×3024" },
]

export default function ComposerWithAttachmentsDemo(): React.ReactElement {
  const [sent, setSent] = React.useState<string | null>(null)
  const [picked, setPicked] = React.useState<string | null>(null)
  return (
    <DemoStage canvasClassName="flex min-h-24 w-full flex-col items-center gap-3 p-6">
      <Composer
        composerId="demo"
        defaultAttachments={SEED}
        defaultValue="Look at the context fabric api to validate the nodes."
        commands={COMMANDS}
        onCommand={(item) => setPicked(item.id)}
        onSend={(draft, _mode, attachments) => setSent(`${draft} (+${attachments.length})`)}
        safetyNote={null}
      />
      {sent ? <p className="text-xs text-muted-foreground">Sent: {sent}</p> : null}
      {picked ? <p className="text-xs text-muted-foreground">Command: {picked}</p> : null}
    </DemoStage>
  )
}
