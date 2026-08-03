import * as React from "react"

import {
  DemoSelect,
  DemoStage,
  DemoToggle,
} from "@/components/docs/demo-controls"
import { UserAvatar } from "@/components/composed/user-avatar"

const AVATAR =
  "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=72&h=72&dpr=2&q=80"

const SIZES = ["size-8", "size-10", "size-12", "size-16"] as const

export default function UserAvatarDemo() {
  const [size, setSize] = React.useState<(typeof SIZES)[number]>("size-12")
  const [loading, setLoading] = React.useState(false)
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
      <div className="flex items-end gap-8">
        <figure className="flex flex-col items-center gap-2">
          <UserAvatar
            className={size}
            key={nonce}
            loading={loading || undefined}
            name="Jenny Hamilton"
            src={`${AVATAR}&v=${nonce}`}
          />
          <figcaption className="text-xs text-muted-foreground">
            image
          </figcaption>
        </figure>
        <figure className="flex flex-col items-center gap-2">
          <UserAvatar
            className={size}
            loading={loading || undefined}
            name="Luna Wyen"
          />
          <figcaption className="text-xs text-muted-foreground">
            no image
          </figcaption>
        </figure>
        <figure className="flex flex-col items-center gap-2">
          <UserAvatar
            className={size}
            loading={loading || undefined}
            name="Paul Smith"
            src="https://example.com/gone.jpg"
          />
          <figcaption className="text-xs text-muted-foreground">
            failed load
          </figcaption>
        </figure>
      </div>
    </DemoStage>
  )
}
