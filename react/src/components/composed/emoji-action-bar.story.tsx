import { defineStory } from "@/registry/story"

import { EmojiActionBar } from "./action-bar/emojis"
import Demo from "@/registry/demos/emoji-action-bar-demo"

export const story = defineStory({
  Component: EmojiActionBar,
  args: {
    initial: {
      hideMore: true,
    },
  },
})

export const examples = defineStory({ Component: Demo })
