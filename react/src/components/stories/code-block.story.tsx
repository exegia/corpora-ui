"use client"

import type { ComponentProps } from "react"
import { defineStory, type TStoryData } from "@/registry/story"

import { CodeBlock } from "@/components/composed/chat/code-block"

type TPreviewProps = TStoryData<
  Pick<
    ComponentProps<typeof CodeBlock>,
    "filename" | "code" | "diff" | "view" | "defaultView" | "keywords"
  >
>

function CodeBlockPreview(props: TPreviewProps) {
  return <CodeBlock {...props} />
}

export const story = defineStory({
  Component: CodeBlockPreview,
  args: {
    initial: {
      filename: "corpus.ts",
      view: "code",
      diff: [
        { type: "context", text: 'const corpus = "Iliad";' },
        { type: "remove", text: "const book = 2;" },
        { type: "add", text: "const book = 1;" },
      ],
      code: 'const corpus = "Iliad";\nconst book = 1;',
    },
  },
})

export const Preview = story.WithControl
