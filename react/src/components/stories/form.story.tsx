"use client"

import { Form } from "@/ui/form"
import { useState } from "react"
import { Field, FieldLabel, FieldError } from "@/ui/field"
import { Input } from "@/ui/input"
import { Button } from "@/ui/button"
import { defineStory } from "@/registry/story"

function ComponentPreview({ placeholder }: { placeholder: string }) {
  const [submitted, setSubmitted] = useState(false)
  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <Form onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }} className="grid gap-4">
      <Field name="email"><FieldLabel>Email</FieldLabel><Input type="email" required placeholder={placeholder} /><FieldError /></Field>
      <Button type="submit">Validate</Button><p role="status">{submitted ? "Email accepted." : "Enter an email address to validate."}</p>
    </Form>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { placeholder: "you@example.com" } },
})

export const Preview = story.WithControl
