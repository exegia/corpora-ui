import { defineStory } from "@/registry/story"

import { PasskeyManagerBlock } from "./passkey-manager-block"

export const story = defineStory({
  Component: PasskeyManagerBlock,
  args: {
    initial: {
      available: true,
      loading: false,
      passkeys: [{ id: "research-laptop", name: "Research laptop" }],
    },
  },
})
