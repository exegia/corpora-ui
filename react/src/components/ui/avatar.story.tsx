import { defineStory } from "@/registry/story"
import { Avatar } from "@/components/atoms/avatar"

export const story = defineStory({
  Component: Avatar,
  args: {
    initial: {
      size: "lg",
      loading: false,
      user: { firstName: "John", lastName: "Doe", status: "online" },
    },
  },
})
