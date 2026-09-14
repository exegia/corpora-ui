import * as React from "react"

import { DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import {
  LinkedAccountsBlock,
  type LinkedIdentity,
} from "@/components/blocks/auth/linked-accounts-block"

const INITIAL: LinkedIdentity[] = [
  { id: "id-1", provider: "google", email: "reader@example.com" },
  { id: "id-2", provider: "github", email: "reader@users.noreply.github.com" },
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function LinkedAccountsDemo() {
  const [identities, setIdentities] = React.useState(INITIAL)
  const [loading, setLoading] = React.useState(false)
  const nextId = React.useRef(3)

  return (
    <DemoStage
      controls={
        <>
          <DemoToggle label="loading" checked={loading} onChange={setLoading} />
          <button
            type="button"
            className="text-xs underline"
            onClick={() => setIdentities(INITIAL)}
          >
            reset
          </button>
        </>
      }
    >
      <div className="w-full max-w-md">
        <LinkedAccountsBlock
          identities={identities}
          loading={loading}
          providers={["google", "apple", "github", "x"]}
          onLink={async (provider) => {
            await delay(900)
            setIdentities((current) => [
              ...current,
              { id: `id-${nextId.current++}`, provider },
            ])
          }}
          onUnlink={async (id) => {
            await delay(600)
            setIdentities((current) => current.filter((identity) => identity.id !== id))
          }}
        />
      </div>
    </DemoStage>
  )
}
