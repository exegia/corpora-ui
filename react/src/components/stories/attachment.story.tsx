"use client"

import { defineStory } from "@/registry/story"

import { Attachment } from "@/components/composed/chat/attachment"

export const story = defineStory({
  Component: Attachment,
  args: [
    {
      variant: "Document chip",
      initial: {
        kind: "document",
        variant: "default",
        title: "Iliad annotations.pdf",
        meta: "PDF · 2.4 MB",
      },
    },
    {
      variant: "Quoted passage",
      initial: {
        kind: "text-selection",
        variant: "preview",
        title: "Iliad 1.1",
        quote: "Sing, goddess, the anger of Achilles.",
      },
    },
    {
      variant: "Reply",
      initial: {
        kind: "chat-reply",
        variant: "preview",
        title: "Annotation discussion",
        author: "Jenny Hamilton",
        time: "2 minutes ago",
        body: "Compare the opening invocation with the Odyssey.",
      },
    },
    {
      variant: "Link preview",
      initial: {
        kind: "url-link",
        variant: "preview",
        title: "Corpora UI",
        domain: "github.com",
        description: "Components for corpus research applications.",
        href: "https://github.com/exegia/corpora-ui",
      },
    },
  ],
})

export const Preview = story.WithControl
