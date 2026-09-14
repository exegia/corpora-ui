import { defineStory } from "@/registry/story"

import { AuthFlowBlock } from "./auth-flow-block"

export const story = defineStory({
  Component: AuthFlowBlock,
  args: {
    initial: {
      flowId: "docs-auth-flow-story",
      successTitle: "You’re signed in",
    },
  },
})
