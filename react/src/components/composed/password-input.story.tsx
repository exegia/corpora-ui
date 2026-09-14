import { defineStory } from "@/registry/story"

import { PasswordInput } from "./password-input"
import Demo from "@/registry/demos/password-input-demo"

export const story = defineStory({
  Component: PasswordInput,
  args: {
    initial: {
      showStrength: true,
      placeholder: "Enter a password",
      "aria-label": "Password",
    },
  },
})

export const examples = defineStory({ Component: Demo })
