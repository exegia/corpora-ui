import * as React from "react"

import { DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import { Textarea } from "@/components/ui/textarea"

export default function TextareaDemo() {
  const [disabled, setDisabled] = React.useState(false)
  const [readOnly, setReadOnly] = React.useState(false)

  return (
    <DemoStage
      controls={
        <>
          <DemoToggle label="disabled" checked={disabled} onChange={setDisabled} />
          <DemoToggle label="readOnly" checked={readOnly} onChange={setReadOnly} />
        </>
      }
    >
      <Textarea
        className="max-w-72"
        placeholder="Add an annotation…"
        disabled={disabled}
        readOnly={readOnly}
        defaultValue={readOnly ? "Marginalia noted on folio 12r." : undefined}
      />
    </DemoStage>
  )
}
