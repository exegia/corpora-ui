"use client"

import { DemoStage } from "@/components/docs/demo-controls"
import { PasswordInput } from "@/components/composed/password-input"

export default function PasswordInputDemo() {
  return (
    <DemoStage>
      <PasswordInput
        className="max-w-64"
        defaultValue="Iliad2026"
        showStrength
      />
    </DemoStage>
  )
}
