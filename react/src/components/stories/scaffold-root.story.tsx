"use client"

import type { ComponentProps } from "react"

import { defineStory } from "@/registry/story"

import { ScaffoldCanvas } from "@/components/blocks/scaffold/scaffold-canvas"
import { ScaffoldInspector } from "@/components/blocks/scaffold/scaffold-inspector"
import { ScaffoldMain } from "@/components/blocks/scaffold/scaffold-main"
import { ScaffoldPanel } from "@/components/blocks/scaffold/scaffold-panel"
import { ScaffoldRoot } from "@/components/blocks/scaffold/scaffold-root"

type PreviewProps = Pick<
  ComponentProps<typeof ScaffoldRoot>,
  "className" | "inspectorOpen" | "inspectorWidth" | "children"
>

function BlockPreview(props: PreviewProps) {
  return <ScaffoldRoot {...props} />
}

export const story = defineStory({
  Component: BlockPreview,
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
