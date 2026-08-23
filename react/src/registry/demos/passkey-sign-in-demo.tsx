import * as React from "react"

import { DemoSelect, DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import { PasskeySignInBlock } from "@/components/blocks/auth/passkey-sign-in-block"

const OUTCOMES = ["success", "cancelled", "error"] as const

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function PasskeySignInDemo() {
  const [outcome, setOutcome] = React.useState<(typeof OUTCOMES)[number]>("success")
  const [available, setAvailable] = React.useState(true)

  return (
    <DemoStage
      controls={
        <>
          <DemoSelect label="outcome" value={outcome} options={OUTCOMES} onChange={setOutcome} />
          <DemoToggle label="available" checked={available} onChange={setAvailable} />
        </>
      }
    >
      <div className="w-full max-w-sm">
        <PasskeySignInBlock
          available={available}
          onSignIn={async () => {
            await delay(900)
            if (outcome === "error") {
              throw new Error("No passkey found for this account.")
            }
            return outcome === "cancelled" ? { cancelled: true } : undefined
          }}
        />
        {!available && (
          <p className="text-center text-xs text-muted-foreground">
            Nothing renders when the device cannot use passkeys.
          </p>
        )}
      </div>
    </DemoStage>
  )
}
