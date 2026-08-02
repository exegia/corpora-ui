import * as React from "react"

import { DemoBrandMark, DemoSelect, DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import { SignupBlock } from "@/components/blocks/auth/signup-block"

const OUTCOMES = ["success", "error"] as const

const ACCENTS = ["none", "corpora", "exegia"] as const

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

export default function SignupDemo() {
  const [outcome, setOutcome] = React.useState<(typeof OUTCOMES)[number]>("success")
  const [social, setSocial] = React.useState(true)
  const [nameField, setNameField] = React.useState(true)
  const [terms, setTerms] = React.useState(true)
  const [controlTerms, setControlTerms] = React.useState(false)
  const [accepted, setAccepted] = React.useState(false)
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
          <DemoToggle label="social" checked={social} onChange={setSocial} />
          <DemoToggle label="showNameField" checked={nameField} onChange={setNameField} />
          <DemoToggle label="showTerms" checked={terms} onChange={setTerms} />
          {/* Stands in for a consumer that ticks the box from its own terms
              dialog: with this on the state lives out here, so "I agree" moves
              the checkbox without the checkbox being touched. */}
          <DemoToggle
            label="controlled terms"
            checked={controlTerms}
            onChange={setControlTerms}
          />
          {controlTerms && (
            <button
              type="button"
              className="text-xs underline"
              onClick={() => setAccepted((value) => !value)}
            >
              {accepted ? "withdraw agreement" : "I agree"}
            </button>
          )}
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
      <SignupBlock
        key={resetKey}
        accent={accent === "none" ? undefined : accent}
        logo={logo ? <DemoBrandMark /> : undefined}
        providers={social ? ["google", "apple", "github"] : []}
        showNameField={nameField}
        showTerms={terms}
        termsChecked={controlTerms ? accepted : undefined}
        onTermsCheckedChange={controlTerms ? setAccepted : undefined}
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
