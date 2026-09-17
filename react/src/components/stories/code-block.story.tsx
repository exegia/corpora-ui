"use client"

import type { ComponentProps, FC } from "react"

import { defineStory } from "@/registry/story"

import { CodeBlock } from "@/components/composed/chat/code-block"

export const story = defineStory({
  Component: CodeBlock as FC<
    Pick<
      ComponentProps<typeof CodeBlock>,
      "filename" | "code" | "diff" | "view"
    >
  >,
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
