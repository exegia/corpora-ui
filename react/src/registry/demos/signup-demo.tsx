import * as React from "react"

import { DemoSelect, DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import { SignupBlock } from "@/components/blocks/auth/signup-block"

const OUTCOMES = ["success", "error"] as const

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

export default function SignupDemo() {
  const [outcome, setOutcome] = React.useState<(typeof OUTCOMES)[number]>("success")
  const [social, setSocial] = React.useState(true)
  const [nameField, setNameField] = React.useState(true)
  const [terms, setTerms] = React.useState(true)
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
          <DemoToggle label="social" checked={social} onChange={setSocial} />
          <DemoToggle label="showNameField" checked={nameField} onChange={setNameField} />
          <DemoToggle label="showTerms" checked={terms} onChange={setTerms} />
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
      <SignupBlock
        key={resetKey}
        providers={social ? ["google", "apple", "github"] : []}
        showNameField={nameField}
        showTerms={terms}
        onSubmit={async () => {
          await delay(1200)
          if (outcome === "error") {
            throw new Error("An account with this email already exists.")
          }
        }}
        onProviderSelect={() => delay(1200)}
      />
    </DemoStage>
  )
}
