import { defineStory } from "@/registry/story"
import { Frame, FrameFooter } from "./frame"
import { Card, CardPanel } from "./card"

export const story = defineStory({
  Component: Frame,
  args: {
    fixed: {
      children: (
        <>
          <Card>
            <CardPanel>Manuscript notes</CardPanel>
          </Card>
          <FrameFooter>Updated today</FrameFooter>
        </>
      ),
    },
  },
})
