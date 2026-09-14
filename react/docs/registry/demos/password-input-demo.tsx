import * as React from "react"

import { DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import { PasswordInput } from "@/components/composed/password-input"

export default function PasswordInputDemo() {
  const [showStrength, setShowStrength] = React.useState(true)
  const [visibilityToggle, setVisibilityToggle] = React.useState(true)
  const [disabled, setDisabled] = React.useState(false)
  const [sound, setSound] = React.useState(true)

  return (
    <DemoStage
      controls={
        <>
          <DemoToggle
            label="showStrength"
            checked={showStrength}
            onChange={setShowStrength}
          />
          <DemoToggle
            label="visibilityToggle"
            checked={visibilityToggle}
            onChange={setVisibilityToggle}
          />
          <DemoToggle label="disabled" checked={disabled} onChange={setDisabled} />
          <DemoToggle label="sound" checked={sound} onChange={setSound} />
        </>
      }
    >
      <PasswordInput
        className="max-w-64"
        showStrength={showStrength}
        visibilityToggle={visibilityToggle}
        disabled={disabled}
        sound={sound}
      />
    </DemoStage>
  )
}
