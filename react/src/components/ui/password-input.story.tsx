import { defineStory } from "@/registry/story"

import { PasswordInput } from "@/components/composed/password-input"

export const story = defineStory({
  Component: PasswordInput,
  args: {
    initial: {
      visibilityToggle: true,
      showStrength: false,
      autoComplete: "new-password",
      placeholder: "Enter password",
    },
  },
})
