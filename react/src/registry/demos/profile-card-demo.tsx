import * as React from "react"

import { DemoSelect, DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import { ProfileCardBlock } from "@/components/blocks/profile/profile-card-block"

const USER = {
  name: "Jenny Hamilton",
  username: "@jennycodes",
  avatar:
    "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=72&h=72&dpr=2&q=80",
}

const ALIGNMENTS = ["center", "start", "end"] as const

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function ProfileCardDemo() {
  const [align, setAlign] = React.useState<(typeof ALIGNMENTS)[number]>("center")
  const [withAvatar, setWithAvatar] = React.useState(true)
  const [withUsername, setWithUsername] = React.useState(true)
  const [action, setAction] = React.useState<string | null>(null)

  return (
    <DemoStage
      controls={
        <>
          <DemoSelect
            label="align"
            value={align}
            options={ALIGNMENTS}
            onChange={setAlign}
          />
          <DemoToggle
            label="avatar"
            checked={withAvatar}
            onChange={setWithAvatar}
          />
          <DemoToggle
            label="username"
            checked={withUsername}
            onChange={setWithUsername}
          />
          <span className="text-xs text-muted-foreground">
            {action ? `selected: ${action}` : "no selection yet"}
          </span>
        </>
      }
    >
      <div className="w-full max-w-64">
        <ProfileCardBlock
          align={align}
          user={{
            name: USER.name,
            username: withUsername ? USER.username : undefined,
            avatar: withAvatar ? USER.avatar : undefined,
          }}
          onProfile={() => setAction("profile")}
          onSettings={() => setAction("settings")}
          onTeams={() => setAction("teams")}
          onInvite={() => setAction("invite")}
          onSignOut={async () => {
            setAction("signing out…")
            await delay(1200)
            setAction("signed out")
          }}
        />
      </div>
    </DemoStage>
  )
}
