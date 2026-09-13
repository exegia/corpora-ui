import * as React from "react"

import User from "@/components/composed/user"
import type { UserType } from "@/components/atoms"
import { CodeBlock } from "@/components/docs/code-block"
import { DemoStage } from "@/components/docs/demo-controls"

const JENNY: UserType = {
  firstName: "Jenny",
  lastName: "Hamilton",
  role: "Admin",
  status: "online",
}

const EXEGIA: UserType = {
  firstName: "Exegia",
  lastName: "Agent",
  role: "Agent",
  verified: true,
}

function Example({
  title,
  code,
  children,
}: {
  title: string
  code: string
  children: React.ReactNode
}) {
  return (
    <section className="flex w-full flex-col gap-2">
      <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
      <div className="flex w-full flex-wrap items-center justify-center gap-6 rounded-lg border border-border-default bg-background/40 p-6">
        {children}
      </div>
      <CodeBlock code={code} />
    </section>
  )
}

export default function UserDemo(): React.ReactElement {
  return (
    <DemoStage canvasClassName="flex w-full max-w-2xl flex-col items-stretch gap-8 p-6">
      <Example
        title="User.Info — identity row"
        code={`import User from "@corpora/ui"

<User.Info user={{ firstName: "Jenny", lastName: "Hamilton", role: "Admin" }} />
<User.Info user={user} description="Read the corpus 2 min ago" />`}
      >
        <User.Info user={JENNY} variant="info" />
        <User.Info
          description="Read the corpus 2 min ago"
          user={EXEGIA}
          variant="info"
        />
      </Example>

      <Example
        title="User.Info — sizes, direction and the audio ring"
        code={`<User.Info user={user} size="md" />
<User.Info user={user} direction="right" />
<User.Info user={user} audio="speaking" />`}
      >
        <User.Info size="md" user={JENNY} variant="info" />
        <User.Info direction="right" user={JENNY} variant="info" />
        <User.Info audio="speaking" user={JENNY} variant="info" />
      </Example>

      <Example
        title="User.Pill — mention chip"
        code={`<User.Pill user={{ firstName: "jenny" }} />`}
      >
        <User.Pill user={{ firstName: "jenny" }} variant="pill" />
      </Example>
    </DemoStage>
  )
}
