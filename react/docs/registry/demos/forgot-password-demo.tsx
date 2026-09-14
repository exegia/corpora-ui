import * as React from "react"

import { DemoBrandMark, DemoSelect, DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import { ForgotPasswordBlock } from "@/components/blocks/auth/forgot-password-block"

const OUTCOMES = ["success", "error"] as const

const ACCENTS = ["none", "corpora", "exegia"] as const

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function ForgotPasswordDemo() {
  const [outcome, setOutcome] = React.useState<(typeof OUTCOMES)[number]>("success")
  const [resetKey, setResetKey] = React.useState(0)
  const [accent, setAccent] = React.useState<(typeof ACCENTS)[number]>("none")
  const [logo, setLogo] = React.useState(false)

  return (
    <DemoStage
      controls={
        <>
          <DemoSelect
            label="submit outcome"
            value={outcome}
            options={OUTCOMES}
            onChange={setOutcome}
          />
          <DemoSelect label="accent" value={accent} options={ACCENTS} onChange={setAccent} />
          <DemoToggle label="logo" checked={logo} onChange={setLogo} />
          <button
            type="button"
            className="text-xs underline"
            onClick={() => setResetKey((k) => k + 1)}
          >
            reset
          </button>
        </>
      }
    >
      <ForgotPasswordBlock
        key={resetKey}
        accent={accent === "none" ? undefined : accent}
        logo={logo ? <DemoBrandMark /> : undefined}
        onSubmit={async () => {
          await delay(1200)
          if (outcome === "error") {
            throw new Error("No account found for this email.")
          }
        }}
      />
    </DemoStage>
  )
}
