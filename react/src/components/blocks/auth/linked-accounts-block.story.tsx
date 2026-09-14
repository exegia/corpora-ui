import { defineStory } from "@/registry/story"

import { LinkedAccountsBlock } from "./linked-accounts-block"

export const story = defineStory({
  Component: LinkedAccountsBlock,
  args: {
    initial: {
      loading: false,
      identities: [
        {
          id: "researcher",
          provider: "github",
          email: "researcher@example.com",
        },
      ],
    },
  },
})
