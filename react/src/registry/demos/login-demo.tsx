import * as React from "react"

import { DemoBrandMark, DemoSelect, DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import { LoginBlock } from "@/components/blocks/auth/login-block"

const OUTCOMES = ["success", "error"] as const

const ACCENTS = ["none", "corpora", "exegia"] as const

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

export default function LoginDemo() {
  const [outcome, setOutcome] = React.useState<(typeof OUTCOMES)[number]>("success")
  const [social, setSocial] = React.useState(true)
  const [rememberMe, setRememberMe] = React.useState(true)
  const [forgotPassword, setForgotPassword] = React.useState(true)
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
          <DemoToggle label="rememberMe" checked={rememberMe} onChange={setRememberMe} />
          <DemoToggle
            label="forgotPassword"
            checked={forgotPassword}
            onChange={setForgotPassword}
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
      <LoginBlock
        key={resetKey}
        accent={accent === "none" ? undefined : accent}
        logo={logo ? <DemoBrandMark /> : undefined}
        providers={social ? ["google", "apple", "github"] : []}
        showRememberMe={rememberMe}
        showForgotPassword={forgotPassword}
        onSubmit={async () => {
          await delay(1200)
          if (outcome === "error") {
            throw new Error("Invalid email or password.")
          }
        }}
        onProviderSelect={() => delay(1200)}
      />
    </DemoStage>
  )
}
