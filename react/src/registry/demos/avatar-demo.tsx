import React, { useCallback } from "react"

import {
  DemoSelect,
  DemoStage,
  DemoToggle,
} from "@/components/docs/demo-controls"
import { Avatar } from "@/components/atoms"
import type {
  AvatarAudio,
  AvatarSize,
  AvatarStatus,
  UserType,
} from "@/components/atoms"

const AVATAR =
  "https://lh3.googleusercontent.com/a/ACg8ocID__S9qxuDKDy8eBAu4lT56ElP0cmi5y_FMFD4ALHPFuoquQxxEg=s120-c"

const SIZES: AvatarSize[] = ["sm", "md", "lg", "xl", "xxl"] as const
const PRESENCE: AvatarStatus[] = ["idle", "online", "offline"] as const
const AUDIO: AvatarAudio[] = ["muted", "unmuted", "speaking"] as const

export default function AvatarDemo() {
  const [size, setSize] = React.useState<AvatarSize>("lg")
  const [loading, setLoading] = React.useState(false)
  // A fresh key each reload, so the image really re-fetches and the skeleton shows.
  const [nonce, setNonce] = React.useState(0)
  const [audio, setAudio] = React.useState<AvatarAudio>("speaking")
  const [user, setUser] = React.useState<UserType>({
    firstName: "John",
    lastName: "Doe",
    avatarUrl: AVATAR,
    status: "online",
  })

  // Speaking/unmuted means live audio, so presence must be online — and going
  // offline/idle drops the ring to muted. Enforced in both handlers.
  const handleStatusChange = useCallback((status: AvatarStatus) => {
    setUser((prev) => ({ ...prev, status }))
    if (status !== "online") setAudio("muted")
  }, [])

  const handleAudioChange = useCallback((next: AvatarAudio) => {
    setAudio(next)
    if (next !== "muted") setUser((prev) => ({ ...prev, status: "online" }))
  }, [])

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
          <DemoToggle
            label="loading"
            checked={loading}
            onChange={(checked) => {
              setLoading(checked)
              if (checked) setAudio("muted")
            }}
          />
          <DemoSelect
            label="presence"
            value={user.status ?? "offline"}
            options={PRESENCE}
            onChange={handleStatusChange}
          />
          <DemoSelect
            label="audio"
            value={audio}
            options={AUDIO}
            onChange={handleAudioChange}
          />
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
        <Avatar
          key={nonce}
          size={size}
          loading={loading}
          audio={audio}
          user={user}
        />
      </div>
    </DemoStage>
  )
}
