"use client"

import { DemoStage } from "@/components/docs/demo-controls"
import AI from "@/components/composed/ai"
import type { TStreamingToken } from "@/components/composed/ai"

const P1 =
  "Pistachio is your fastest-growing flavor — sales are up 23% this month and margins beat vanilla by 8 points."
const P2: TStreamingToken[] = [
  {
    cite: "scoopdata.io",
    title: "Scoop Data · Flavor report",
    description:
      "Monthly flavor velocity across 1,200 parlours. Pistachio led growth for the third month running.",
    href: "https://scoopdata.io",
  },
  ..."Stone-fruit flavors trend in the same range."
    .split(" ")
    .map((text) => ({ text })),
]

export default function StreamingTextDemo() {
  return (
    <DemoStage canvasClassName="flex min-h-24 w-full justify-center p-6">
      <AI.StreamingText paragraphs={[P1, P2]} streaming />
    </DemoStage>
  )
}
