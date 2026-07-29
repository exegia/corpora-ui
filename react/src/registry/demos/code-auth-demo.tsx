import * as React from "react"

import { DemoSelect, DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import { CodeAuthBlock } from "@/components/blocks/auth/code-auth-block"

const CHANNELS = ["email", "sms"] as const
const LENGTHS = ["4", "6"] as const

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function CodeAuthDemo() {
  const [channel, setChannel] = React.useState<(typeof CHANNELS)[number]>("email")
  const [length, setLength] = React.useState<(typeof LENGTHS)[number]>("6")
  const [autoSubmit, setAutoSubmit] = React.useState(true)
  const [resetKey, setResetKey] = React.useState(0)

  return (
    <DemoStage
      controls={
        <>
          <DemoSelect label="channel" value={channel} options={CHANNELS} onChange={setChannel} />
          <DemoSelect label="length" value={length} options={LENGTHS} onChange={setLength} />
          <DemoToggle label="autoSubmit" checked={autoSubmit} onChange={setAutoSubmit} />
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
      <div className="flex flex-col items-center gap-2">
        <CodeAuthBlock
          key={`${resetKey}-${length}`}
          channel={channel}
          destination={channel === "email" ? "y•••@example.com" : "•••-•••-1234"}
          length={Number(length)}
          autoSubmit={autoSubmit}
          resendSeconds={10}
          onVerify={async (code) => {
            await delay(900)
            if (code !== "1".repeat(Number(length))) {
              throw new Error("Invalid code. Try again.")
            }
          }}
        />
        <p className="text-xs text-muted-foreground">
          Enter {Number(length) === 4 ? "1111" : "111111"} to pass verification.
        </p>
      </div>
    </DemoStage>
  )
}
