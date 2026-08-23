import { LogOutIcon, SettingsIcon, UserIcon, UserPlusIcon, UsersIcon } from "lucide-react"
import * as React from "react"

import { DemoSelect, DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import {
  ProfileCardBlock,
  type ProfileCardItem,
} from "@/components/blocks/profile/profile-card-block"

const USER = {
  name: "Jenny Hamilton",
  username: "@jennycodes",
  avatar:
    "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=72&h=72&dpr=2&q=80",
}

const ALIGNMENTS = ["center", "start", "end"] as const
const VARIANTS = ["expanded", "collapsed"] as const
const PRESENCE = ["online", "offline", "none"] as const

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function ProfileCardDemo() {
  const [align, setAlign] = React.useState<(typeof ALIGNMENTS)[number]>("center")
  const [withAvatar, setWithAvatar] = React.useState(true)
  const [withUsername, setWithUsername] = React.useState(true)
  const [action, setAction] = React.useState<string | null>(null)
  const [variant, setVariant] =
    React.useState<(typeof VARIANTS)[number]>("expanded")
  const [presence, setPresence] =
    React.useState<(typeof PRESENCE)[number]>("online")

  const items: ProfileCardItem[] = [
    { type: "label", label: "Management" },
    {
      id: "profile",
      label: "Profile",
      icon: <UserIcon aria-hidden="true" />,
      onSelect: () => setAction("profile"),
    },
    {
      id: "settings",
      label: "Settings",
      icon: <SettingsIcon aria-hidden="true" />,
      shortcut: "⌘,",
      onSelect: () => setAction("settings"),
    },
    { type: "separator" },
    {
      id: "teams",
      label: "Teams",
      icon: <UsersIcon aria-hidden="true" />,
      onSelect: () => setAction("teams"),
    },
    {
      id: "invite",
      label: "Invite",
      icon: <UserPlusIcon aria-hidden="true" />,
      onSelect: () => setAction("invite"),
    },
    { type: "separator" },
    {
      id: "sign-out",
      label: "Log out",
      icon: <LogOutIcon aria-hidden="true" />,
      variant: "destructive",
      onSelect: async () => {
        setAction("signing out…")
        await delay(1200)
        setAction("signed out")
      },
    },
  ]

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
          <DemoSelect
            label="variant"
            value={variant}
            options={VARIANTS}
            onChange={setVariant}
          />
          <DemoSelect
            label="presence"
            value={presence}
            options={PRESENCE}
            onChange={setPresence}
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
          items={items}
          user={{
            name: USER.name,
            username: withUsername ? USER.username : undefined,
            avatar: withAvatar ? USER.avatar : undefined,
            presence: presence === "none" ? undefined : presence,
          }}
          variant={variant}
        />
      </div>
    </DemoStage>
  )
}
