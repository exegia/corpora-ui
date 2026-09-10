import * as React from "react"

import { DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import { StreamingText, type StreamingToken } from "@/components/composed/chat"

const P1 = "Pistachio is your fastest-growing flavor — sales are up 23% this month and margins beat vanilla by 8 points."
const P2: StreamingToken[] = [{ cite: "scoopdata.io", title: "Scoop Data · Flavor report", description: "Monthly flavor velocity across 1,200 parlours. Pistachio led growth for the third month running.", href: "https://scoopdata.io" }, ..."Stone-fruit flavors trend in the same range.".split(" ").map((text) => ({ text }))]

export default function StreamingTextDemo(): React.ReactElement {
  const [streaming, setStreaming] = React.useState(true)
  const [key, setKey] = React.useState(0)
  return (
    <DemoStage
      canvasClassName="flex min-h-24 w-full justify-center p-6"
      controls={
        <DemoToggle label="streaming" checked={streaming} onChange={(v) => { setStreaming(v); setKey((k) => k + 1) }} />
      }
    >
      <StreamingText
        key={key}
        paragraphs={[P1, P2]}
        streaming={streaming}
      />
    </DemoStage>
  )
}
