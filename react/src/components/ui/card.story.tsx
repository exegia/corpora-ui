import { defineStory } from "@/registry/story"
import { Card, CardHeader, CardPanel, CardTitle } from "./card"

export const story = defineStory({
  Component: Card,
  args: {
    fixed: {
      children: (
        <>
          <CardHeader>
            <CardTitle>Manuscript</CardTitle>
          </CardHeader>
          <CardPanel>Explore this passage and its annotations.</CardPanel>
        </>
      ),
    },
  },
})
