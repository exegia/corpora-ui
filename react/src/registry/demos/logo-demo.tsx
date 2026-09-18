"use client"

import { Logo } from "@/components/composed/logo"
import { DemoBrandMark, DemoStage } from "@/components/docs/demo-controls"

export default function LogoDemo() {
  return (
    <DemoStage>
      <Logo
        href="#logo-demo"
        mark={<DemoBrandMark />}
        name="Corpora"
        wordmark={
          <>
            corpora<span className="text-muted-foreground">/ui</span>
          </>
        }
      />
    </DemoStage>
  )
}
