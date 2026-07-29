import * as React from "react"

import { DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function FieldDemo() {
  const id = React.useId()
  const [description, setDescription] = React.useState(true)
  const [disabled, setDisabled] = React.useState(false)

  return (
    <DemoStage
      controls={
        <>
          <DemoToggle
            label="description"
            checked={description}
            onChange={setDescription}
          />
          <DemoToggle label="disabled" checked={disabled} onChange={setDisabled} />
        </>
      }
    >
      <Field className="w-full max-w-64" disabled={disabled}>
        <FieldLabel htmlFor={id}>Email</FieldLabel>
        <Input id={id} type="email" placeholder="you@example.com" />
        {description && (
          <FieldDescription>
            We will never share your email.
          </FieldDescription>
        )}
      </Field>
    </DemoStage>
  )
}
