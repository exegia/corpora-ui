import * as React from "react"

import { DemoSelect, DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import {
  SocialProviders,
  type SocialProvider,
} from "@/components/composed/social-providers"

const ACTIONS = ["continue", "login", "signup"] as const
const LAYOUTS = ["stack", "row"] as const

export default function SocialProvidersDemo() {
  const [action, setAction] = React.useState<(typeof ACTIONS)[number]>("continue")
  const [layout, setLayout] = React.useState<(typeof LAYOUTS)[number]>("stack")
  const [withX, setWithX] = React.useState(false)
  const [loading, setLoading] = React.useState<SocialProvider | null>(null)

  const providers: SocialProvider[] = withX
    ? ["google", "apple", "github", "x"]
    : ["google", "apple", "github"]

  return (
    <DemoStage
      controls={
        <>
          <DemoSelect label="action" value={action} options={ACTIONS} onChange={setAction} />
          <DemoSelect label="layout" value={layout} options={LAYOUTS} onChange={setLayout} />
          <DemoToggle label="include X" checked={withX} onChange={setWithX} />
        </>
      }
    >
      <SocialProviders
        className="max-w-64"
        providers={providers}
        action={action}
        layout={layout}
        loadingProvider={loading}
        onSelect={(provider) => {
          setLoading(provider)
          window.setTimeout(() => setLoading(null), 1200)
        }}
      />
    </DemoStage>
  )
}
