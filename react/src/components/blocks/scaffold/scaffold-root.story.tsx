"use client"

import { defineStory } from "@/registry/story"

import { ScaffoldCanvas } from "./scaffold-canvas"
import { ScaffoldInspector } from "./scaffold-inspector"
import { ScaffoldMain } from "./scaffold-main"
import { ScaffoldPanel } from "./scaffold-panel"
import { ScaffoldRoot } from "./scaffold-root"

export const story = defineStory({
  Component: ScaffoldRoot,
  args: {
    initial: {
      className: "h-[28rem] w-full",
      inspectorOpen: false,
      inspectorWidth: 272,
    },
    fixed: {
      children: (
        <ScaffoldMain>
          <ScaffoldCanvas>
            <ScaffoldPanel>
              <div className="p-6">Corpus workspace</div>
            </ScaffoldPanel>
          </ScaffoldCanvas>
          <ScaffoldInspector name="Passage details">
            <div className="p-4">Selected passage: a.1, ¶1–¶2</div>
          </ScaffoldInspector>
        </ScaffoldMain>
      ),
    },
  },
})

export const Preview = story.WithControl
