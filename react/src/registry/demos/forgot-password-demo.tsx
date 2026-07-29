import * as React from "react"

import { DemoSelect, DemoStage } from "@/components/docs/demo-controls"
import { ForgotPasswordBlock } from "@/components/blocks/auth/forgot-password-block"

const OUTCOMES = ["success", "error"] as const

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function ForgotPasswordDemo() {
  const [outcome, setOutcome] = React.useState<(typeof OUTCOMES)[number]>("success")
  const [resetKey, setResetKey] = React.useState(0)

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
