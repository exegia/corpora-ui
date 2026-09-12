import * as React from "react"

import {
  DemoSelect,
  DemoStage,
  DemoToggle,
} from "@/components/docs/demo-controls"
import { Avatar } from "@/components/atoms"
import type { AvatarSize, AvatarStatus, UserType } from "@/components/atoms"

const AVATAR =
  "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=72&h=72&dpr=2&q=80"

const SIZES: AvatarSize[] = ["small", "medium", "large", "xlarge"] as const
const PRESENCE: AvatarStatus[] = ["idle", "online", "offline"] as const

export default function UserAvatarDemo() {
  const [size, setSize] = React.useState<AvatarSize>("small")
  const [loading, setLoading] = React.useState(false)
  const [status, setStatus] = React.useState<AvatarStatus>("online")
  const [nonce, setNonce] = React.useState(0)
  const [user] = React.useState<UserType>({
    firstName: "John",
    lastName: "Doe",
    avatarUrl: `${AVATAR}&v=${nonce}`,
  })
  const [bezel, setBezel] = React.useState(true)
  // The second avatar is named: its badge is flipped through the store by
  // id, the way a socket handler would, rather than through a prop.
  // const paul = useUserAvatarActions("demo-paul")
  // A fresh URL each time, so the image really reloads and the skeleton shows.

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
            value={status}
            options={PRESENCE}
            onChange={setStatus}
          />
          <DemoToggle label="bezel" checked={bezel} onChange={setBezel} />

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
        <Avatar size={size} key={nonce} loading={loading} user={user} />
      </div>
    </DemoStage>
  )
}
