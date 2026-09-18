"use client"

import { useState, type ComponentProps } from "react"

import { defineStory } from "@/registry/story"

import { composerDemoOptions } from "@/registry/demos/composer-options"
import { Bubble } from "@/components/atoms"
import {
  Attachment,
  type TComposerAttachment,
} from "@/components/composed/chat"
import { AiPanel } from "@/components/blocks/chat/base"

type TPreviewProps = Pick<
  ComponentProps<typeof AiPanel>,
  "scope" | "headerTitle" | "className" | "thread" | "locked"
>

function BlockPreview(props: TPreviewProps) {
  const [messages, setMessages] = useState<
    { text: string; attachments: TComposerAttachment[] }[]
  >([])
  return (
    <AiPanel
      {...props}
      thread={
        <>
          {props.thread}
          {messages.map((message, index) => (
            <Bubble key={index} variant="sender">
              {message.text && <Bubble.Message>{message.text}</Bubble.Message>}
              {message.attachments.length > 0 && (
                <Bubble.Message unstyled>
                  {message.attachments.map((attachment) => (
                    <Attachment
                      key={attachment.id}
                      {...attachment}
                      variant="preview"
                    />
                  ))}
                </Bubble.Message>
              )}
            </Bubble>
          ))}
        </>
      }
      composerProps={{
        ...composerDemoOptions,
        onSubmit: (text, _mode, attachments) =>
          setMessages((items) => [...items, { text, attachments }]),
      }}
    />
  )
}

export const story = defineStory({
  Component: BlockPreview,
  args: {
    initial: {
      scope: { kind: "passage", label: "a.1", range: "¶1–¶2" },
      headerTitle: "Context Fabric",
      className: "h-[32rem] w-full",
      thread: "Validate this passage against the schema.",
    },
  },
})

export const Preview = story.WithControl
