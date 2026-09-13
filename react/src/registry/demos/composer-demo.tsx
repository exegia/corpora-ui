import * as React from "react"

import { BarChart3, Globe, Layers, Paperclip } from "lucide-react"

import { CodeBlock } from "@/components/docs/code-block"
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

function Example({ title, code, children }: { title: string; code: string; children: React.ReactNode }) {
  return (
    <section className="flex w-full flex-col gap-2">
      <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
      <div className="flex w-full flex-col items-center rounded-lg border border-border-default bg-background/40 p-6">{children}</div>
      <CodeBlock code={code} />
    </section>
  )
}

export default function ComposerDemo(): React.ReactElement {
  const [sent, setSent] = React.useState<string | null>(null)
  const [picked, setPicked] = React.useState<string | null>(null)
  return (
    <DemoStage canvasClassName="flex w-full max-w-3xl flex-col items-stretch gap-8 p-6">
      <Example
        title="Composer"
        code={`import { Composer } from "@corpora/ui"

<Composer onSend={(draft) => send(draft)} />`}
      >
        <Composer onSend={(draft) => setSent(draft)} placeholder="Ask about this selection…" />
      </Example>

      <Example
        title="Composer with attachments"
        code={`import { Composer, type ComposerAttachment } from "@corpora/ui"
import type { MenuCommandItem } from "@corpora/ui"

const attachments: ComposerAttachment[] = [
  { id: "pdf", kind: "document", title: "Q3-financial-report.pdf", meta: "PDF · 2.4 MB" },
  { id: "img", kind: "image", title: "IMG_2048.jpg", meta: "JPG · 1.2 MB · 4032×3024" },
]

<Composer
  composerId="demo"
  defaultAttachments={attachments}
  defaultValue="Look at the context fabric api to validate the nodes."
  commands={commands}
  onCommand={(item) => pick(item.id)}
  onSend={(draft, _mode, atts) => send(draft, atts)}
  safetyNote={null}
/>`}
      >
        <Composer
          composerId="demo"
          defaultAttachments={SEED}
          defaultValue="Look at the context fabric api to validate the nodes."
          commands={COMMANDS}
          onCommand={(item) => setPicked(item.id)}
          onSend={(draft, _mode, attachments) => setSent(`${draft} (+${attachments.length})`)}
          safetyNote={null}
        />
      </Example>
      {sent ? <p className="text-center text-xs text-muted-foreground">Sent: {sent}</p> : null}
      {picked ? <p className="text-center text-xs text-muted-foreground">Command: {picked}</p> : null}
    </DemoStage>
  )
}
