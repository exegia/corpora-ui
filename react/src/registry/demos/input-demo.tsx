import * as React from "react"

import { DemoSelect, DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import { Input } from "@/components/ui/input"

const SIZES = ["sm", "default", "lg"] as const
const TYPES = ["text", "email", "password", "search", "file"] as const

export default function InputDemo() {
  const [size, setSize] = React.useState<(typeof SIZES)[number]>("default")
  const [type, setType] = React.useState<(typeof TYPES)[number]>("text")
  const [disabled, setDisabled] = React.useState(false)
  const [invalid, setInvalid] = React.useState(false)

  return (
    <DemoStage
      controls={
        <>
          <DemoSelect label="size" value={size} options={SIZES} onChange={setSize} />
          <DemoSelect label="type" value={type} options={TYPES} onChange={setType} />
          <DemoToggle label="disabled" checked={disabled} onChange={setDisabled} />
          <DemoToggle label="invalid" checked={invalid} onChange={setInvalid} />
        </>
      }
    >
      <Input
        className="max-w-64"
        size={size}
        type={type}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        placeholder="Type something…"
      />
    </DemoStage>
  )
}
