import * as React from "react"

import {
  DemoSelect,
  DemoStage,
  DemoToggle,
} from "@/components/docs/demo-controls"
import { UserAvatar, useUserAvatarActions } from "@/components/user-avatar"
import type { UserPresence } from "@/components/user-avatar"

const AVATAR =
  "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=72&h=72&dpr=2&q=80"

const SIZES = ["size-8", "size-10", "size-12", "size-16"] as const
const PRESENCE = ["none", "online", "offline"] as const

export default function UserAvatarDemo() {
  const [size, setSize] = React.useState<(typeof SIZES)[number]>("size-12")
  const [loading, setLoading] = React.useState(false)
  const [presence, setPresence] =
    React.useState<(typeof PRESENCE)[number]>("online")
  const [bezel, setBezel] = React.useState(true)
  // The second avatar is named: its badge is flipped through the store by
  // id, the way a socket handler would, rather than through a prop.
  const paul = useUserAvatarActions("demo-paul")
  // A fresh URL each time, so the image really reloads and the skeleton shows.
  const [nonce, setNonce] = React.useState(0)

  return (
    <DemoStage
      controls={
        <>
          <DemoSelect
            label="size"
            value={size}
            options={SIZES}
            onChange={setSize}
          />
          <DemoToggle label="loading" checked={loading} onChange={setLoading} />
          <DemoSelect
            label="presence"
            value={presence}
            options={PRESENCE}
            onChange={setPresence}
          />
          <DemoToggle label="bezel" checked={bezel} onChange={setBezel} />
          <button
            type="button"
            className="text-xs underline"
            onClick={() => paul.togglePresence()}
          >
            toggle Paul (by id)
          </button>
          <button
            type="button"
            className="text-xs underline"
            onClick={() => setNonce((n) => n + 1)}
          >
            reload image
          </button>
        </>
      }
    >
      <div className="flex flex-row items-center gap-4">
        <UserAvatar
          bezel={bezel}
          className={size}
          key={nonce}
          loading={loading || undefined}
          name="Jenny Hamilton"
          presence={
            presence === "none" ? undefined : (presence as UserPresence)
          }
          src={`${AVATAR}&v=${nonce}`}
        />
        <UserAvatar
          avatarId="demo-paul"
          bezel={bezel}
          className={size}
          loading={loading || undefined}
          name="Paul Smith"
          src="https://example.com/gone.jpg"
        />
      </div>
    </DemoStage>
  )
}
