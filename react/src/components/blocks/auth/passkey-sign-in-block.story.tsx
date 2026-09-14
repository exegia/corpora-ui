import { defineStory } from "@/registry/story"

import { PasskeySignInBlock } from "./passkey-sign-in-block"

export const story = defineStory({
  Component: PasskeySignInBlock,
  args: {
    initial: { available: true, label: "Sign in with a passkey" },
  },
})
