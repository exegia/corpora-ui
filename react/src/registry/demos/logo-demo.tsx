import * as React from "react"

import { Logo } from "@/components/composed/logo"
import {
  DemoBrandMark,
  DemoSelect,
  DemoStage,
  DemoToggle,
} from "@/components/docs/demo-controls"

const MARKS = ["svg", "image", "monogram"] as const

const IMAGE_MARK =
  "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=64&h=64&dpr=2&q=80&fit=crop"

export default function LogoDemo() {
  const [markKind, setMarkKind] = React.useState<(typeof MARKS)[number]>("svg")
  const [folded, setFolded] = React.useState(false)
  const [link, setLink] = React.useState(true)

  return (
    <DemoStage
      controls={
        <>
          <DemoSelect
            label="mark"
            value={markKind}
            options={MARKS}
            onChange={setMarkKind}
          />
          <DemoToggle label="folded" checked={folded} onChange={setFolded} />
          <DemoToggle label="link" checked={link} onChange={setLink} />
        </>
      }
    >
      <Logo
        href={link ? "#" : undefined}
        mark={markKind === "svg" ? <DemoBrandMark /> : undefined}
        name="Corpora"
        src={markKind === "image" ? IMAGE_MARK : undefined}
        variant={folded ? "mark" : "full"}
        wordmark={
          <>
            corpora<span className="text-muted-foreground">/ui</span>
          </>
        }
      />
    </DemoStage>
  )
}
