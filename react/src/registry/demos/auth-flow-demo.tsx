import * as React from "react"

import { AuthFlowBlock } from "@/components/blocks/auth/auth-flow-block"
import {
  useAuthFlow,
  useAuthFlowActions,
  useAuthSession,
  useAuthSessionActions,
} from "@/components/blocks/auth/auth-state"
import { DemoBrandMark, DemoSelect, DemoStage, DemoToggle } from "@/components/docs/demo-controls"

const ACCENTS = ["none", "corpora", "exegia"] as const

/** Keyed off the default flow so the demo never fights an app-level flow. */
const FLOW_ID = "auth-flow-demo"

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

/** The wire between the flow and the session, made visible. */
function SessionReadout() {
  const flow = useAuthFlow(FLOW_ID)
  const session = useAuthSession()
  const { reset } = useAuthFlowActions(FLOW_ID)
  const { signOut } = useAuthSessionActions()

  return (
    <p className="flex items-center gap-2 text-xs text-muted-foreground">
      <span>
        step <code>{flow.step}</code> · session <code>{session.status}</code>
        {session.user ? <> · {session.user.name}</> : null}
      </span>
      {session.user && (
        <button
          type="button"
          className="underline"
          onClick={() => {
            // signOut resets the DEFAULT flow; this demo drives its own id.
            signOut()
            reset()
          }}
        >
          sign out
        </button>
      )}
    </p>
  )
}

export default function AuthFlowDemo() {
  const [accent, setAccent] = React.useState<(typeof ACCENTS)[number]>("none")
  const [logo, setLogo] = React.useState(false)

  return (
    <DemoStage
      controls={
        <>
          <DemoSelect label="accent" value={accent} options={ACCENTS} onChange={setAccent} />
          <DemoToggle label="logo" checked={logo} onChange={setLogo} />
        </>
      }
    >
      <div className="flex w-full flex-col items-center gap-3">
        <AuthFlowBlock
          flowId={FLOW_ID}
          accent={accent === "none" ? undefined : accent}
          logo={logo ? <DemoBrandMark /> : undefined}
          onLogin={async ({ email }) => {
            await delay(700)
            // Any credentials pass, but a code round-trip is required —
            // the { verify } directive carries the identifier along.
            return { verify: { identifier: email } }
          }}
          onSignup={async ({ email }) => {
            await delay(700)
            return { verify: { identifier: email } }
          }}
          onProviderSelect={async () => {
            await delay(700)
            return { user: { id: "u-demo", name: "Ada Researcher" } }
          }}
          onVerifyCode={async (code) => {
            await delay(700)
            if (code !== "111111") throw new Error("Invalid code. Try again.")
            return {
              user: {
                id: "u-demo",
                name: "Ada Researcher",
                email: "ada@corpora.local",
              },
            }
          }}
          onResendCode={() => delay(400)}
          onRequestReset={async () => {
            await delay(700)
            // No directive: the block shows its own "link sent" state.
          }}
          successDescription="This session came out of completeAuthFlow — sign out below to run it again."
        />
        <SessionReadout />
        <p className="text-xs text-muted-foreground">
          Enter 111111 to pass verification.
        </p>
      </div>
    </DemoStage>
  )
}
