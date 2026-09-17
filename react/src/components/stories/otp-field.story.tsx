"use client"

import type { ComponentProps } from "react"
import { defineStory } from "@/registry/story"
import { Label } from "@/components/ui/label"
import { OTPField, OTPFieldInput } from "@/components/ui/otp-field"

type PreviewProps = Pick<
  ComponentProps<typeof OTPField>,
  "size" | "disabled" | "sound"
> & { length: 4 | 6 | 8 }

function OTPFieldPreview({ length, ...props }: PreviewProps) {
  return (
    <div className="overflow-x-auto p-6">
      <Label className="sr-only" htmlFor="otp-story">
        One-time passcode
      </Label>
      <OTPField {...props} id="otp-story" key={length} length={length}>
        {Array.from({ length }, (_, i) => (
          <OTPFieldInput key={i} aria-label={`Digit ${i + 1}`} />
        ))}
      </OTPField>
    </div>
  )
}

export const story = defineStory({
  Component: OTPFieldPreview,
  args: {
    initial: { length: 6, size: "default", disabled: false, sound: true },
  },
})

export const Preview = story.WithControl
