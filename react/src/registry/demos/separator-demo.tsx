import * as React from "react"

import { DemoSelect, DemoStage } from "@/components/docs/demo-controls"
import { Separator } from "@/components/ui/separator"

const ORIENTATIONS = ["horizontal", "vertical"] as const

export default function SeparatorDemo() {
  const [orientation, setOrientation] =
    React.useState<(typeof ORIENTATIONS)[number]>("horizontal")

  return (
    <DemoStage
      controls={
        <DemoSelect
          label="orientation"
          value={orientation}
          options={ORIENTATIONS}
          onChange={setOrientation}
        />
      }
    >
      {orientation === "horizontal" ? (
        <div className="flex w-full max-w-64 flex-col gap-3 text-sm">
          <p>Manuscripts</p>
          <Separator />
          <p>Codices</p>
        </div>
      ) : (
        <div className="flex h-8 items-center gap-3 text-sm">
          <p>Read</p>
          <Separator orientation="vertical" />
          <p>Annotate</p>
          <Separator orientation="vertical" />
          <p>Discuss</p>
        </div>
      )}
    </DemoStage>
  )
}
