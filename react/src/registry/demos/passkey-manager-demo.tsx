import * as React from "react"

import { DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import {
  PasskeyManagerBlock,
  type PasskeyRecord,
} from "@/components/blocks/auth/passkey-manager-block"

const INITIAL: PasskeyRecord[] = [
  {
    id: "pk-1",
    name: "MacBook Pro",
    createdAt: "2026-05-02T10:00:00.000Z",
    lastUsedAt: "2026-07-28T08:12:00.000Z",
  },
  { id: "pk-2", name: "iPhone", createdAt: "2026-06-14T18:30:00.000Z" },
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function PasskeyManagerDemo() {
  const [passkeys, setPasskeys] = React.useState(INITIAL)
  const [available, setAvailable] = React.useState(true)
  const [loading, setLoading] = React.useState(false)
  const nextId = React.useRef(3)

  return (
    <DemoStage
      controls={
        <>
          <DemoToggle label="available" checked={available} onChange={setAvailable} />
          <DemoToggle label="loading" checked={loading} onChange={setLoading} />
          <button
            type="button"
            className="text-xs underline"
            onClick={() => setPasskeys(INITIAL)}
          >
            reset
          </button>
        </>
      }
    >
      <div className="w-full max-w-md">
        <PasskeyManagerBlock
          available={available}
          loading={loading}
          passkeys={passkeys}
          onRegister={async () => {
            await delay(900)
            const id = `pk-${nextId.current++}`
            setPasskeys((current) => [
              ...current,
              { id, name: "New passkey", createdAt: new Date().toISOString() },
            ])
          }}
          onRename={async (id, name) => {
            await delay(600)
            setPasskeys((current) =>
              current.map((passkey) =>
                passkey.id === id ? { ...passkey, name } : passkey,
              ),
            )
          }}
          onDelete={async (id) => {
            await delay(600)
            setPasskeys((current) => current.filter((passkey) => passkey.id !== id))
          }}
        />
      </div>
    </DemoStage>
  )
}
