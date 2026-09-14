import * as React from "react"

import { DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function CheckboxDemo() {
  const id = React.useId()
  const [disabled, setDisabled] = React.useState(false)
  const [indeterminate, setIndeterminate] = React.useState(false)
  const [sound, setSound] = React.useState(true)

  return (
    <DemoStage
      controls={
        <>
          <DemoToggle label="disabled" checked={disabled} onChange={setDisabled} />
          <DemoToggle
            label="indeterminate"
            checked={indeterminate}
            onChange={setIndeterminate}
          />
          <DemoToggle label="sound" checked={sound} onChange={setSound} />
        </>
      }
    >
      <div className="flex items-center gap-2">
        <Checkbox
          id={id}
          disabled={disabled}
          indeterminate={indeterminate}
          sound={sound}
          defaultChecked
        />
        <Label htmlFor={id}>Enable notifications</Label>
      </div>
    </DemoStage>
  )
}
