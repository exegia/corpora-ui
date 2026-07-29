import * as React from "react"

import { DemoSelect, DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import { OTPField, OTPFieldInput } from "@/components/ui/otp-field"

const LENGTHS = ["4", "6"] as const

export default function OtpFieldDemo() {
  const [length, setLength] = React.useState<(typeof LENGTHS)[number]>("6")
  const [disabled, setDisabled] = React.useState(false)
  const [sound, setSound] = React.useState(true)
  const [value, setValue] = React.useState("")
  const count = Number(length)

  return (
    <DemoStage
      controls={
        <>
          <DemoSelect
            label="length"
            value={length}
            options={LENGTHS}
            onChange={(next) => {
              setLength(next)
              setValue("")
            }}
          />
          <DemoToggle label="disabled" checked={disabled} onChange={setDisabled} />
          <DemoToggle label="sound" checked={sound} onChange={setSound} />
        </>
      }
    >
      <OTPField
        length={count}
        value={value}
        onValueChange={setValue}
        disabled={disabled}
        sound={sound}
      >
        {Array.from({ length: count }, (_, index) => (
          <OTPFieldInput
            key={`slot-${index}`}
            aria-label={`Digit ${index + 1} of ${count}`}
          />
        ))}
      </OTPField>
    </DemoStage>
  )
}
