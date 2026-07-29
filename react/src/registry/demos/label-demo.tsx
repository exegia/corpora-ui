import * as React from "react"

import { DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function LabelDemo() {
  const id = React.useId()
  const [disabled, setDisabled] = React.useState(false)
  const [sound, setSound] = React.useState(false)

  return (
    <DemoStage
      controls={
        <>
          <DemoToggle label="disabled" checked={disabled} onChange={setDisabled} />
          <DemoToggle label="sound" checked={sound} onChange={setSound} />
        </>
      }
    >
      <div className="flex items-center gap-2">
        <Checkbox id={id} disabled={disabled} />
        <Label htmlFor={id} sound={sound}>
          Accept terms and conditions
        </Label>
      </div>
    </DemoStage>
  )
}
