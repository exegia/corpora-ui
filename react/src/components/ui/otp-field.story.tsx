import { defineStory } from "@/registry/story"
import { OTPField, OTPFieldInput } from "./otp-field"

export const story = defineStory({
  Component: OTPField,
  args: {
    initial: { length: 6, size: "default", disabled: false, sound: true },
    fixed: {
      length: 6,
      children: (
        <>
          {Array.from({ length: 6 }, (_, i) => (
            <OTPFieldInput key={i} aria-label={`Digit ${i + 1}`} />
          ))}
        </>
      ),
    },
  },
})
