"use client"

import * as React from "react"

import { DemoStage } from "@/components/docs/demo-controls"
import { SocialProviders } from "@/components/composed/social-providers"
import type { TSocialProvider } from "@/components/composed/types"

export default function SocialProvidersDemo() {
  const [loading, setLoading] = React.useState<TSocialProvider | null>(null)

  return (
    <DemoStage>
      <SocialProviders
        className="max-w-64"
        providers={["google", "apple", "github"]}
        loadingProvider={loading}
        onSelect={(provider) => {
          setLoading(provider)
          window.setTimeout(() => setLoading(null), 1200)
        }}
      />
    </DemoStage>
  )
}
