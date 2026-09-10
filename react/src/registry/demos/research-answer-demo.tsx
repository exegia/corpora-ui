import * as React from "react"

import { DemoStage } from "@/components/docs/demo-controls"
import { ResearchAnswer } from "@/components/composed/chat"

export default function ResearchAnswerDemo(): React.ReactElement {
  const [last, setLast] = React.useState("")
  return (
    <DemoStage canvasClassName="flex min-h-24 w-full flex-col items-center gap-3 p-6">
      <ResearchAnswer
        kickerSub="Answered from 3 passages · 0.8 s"
        content="The quarrel opens when Agamemnon refuses Chryses’ ransom. Apollo’s plague follows, and only Achilles’ call for an assembly forces the priest’s daughter to be returned — the first boundary of the poem (¶12, RC003)."
        source="Iliad · Homer corpus"
        date="c. 750 BCE · Sep 2"
        authors="Homer · M. L. West"
        onCopyCitation={() => setLast("copy citation")}
        onShare={() => setLast("share")}
        onAddToList={() => setLast("add to list")}
      />
      {last ? <p className="text-xs text-muted-foreground">Last action: {last}</p> : null}
    </DemoStage>
  )
}
