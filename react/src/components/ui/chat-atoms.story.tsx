"use client"

import type { ComponentProps } from "react"
import { FileText } from "lucide-react"
import { defineStory } from "@/registry/story"
import { IconTile } from "./chat/icon-tile"
import { Thumbnail } from "./chat/thumbnail"
import { AvatarHandle } from "./chat/avatar-handle"
import { Waveform } from "./chat/waveform"
import { SendButton } from "./chat/buttons"

function IconTilePreview(
  props: Pick<ComponentProps<typeof IconTile>, "size" | "tone">
) {
  return (
    <div className="p-6">
      <IconTile {...props}>
        <FileText aria-hidden="true" />
      </IconTile>
    </div>
  )
}

function ThumbnailPreview(
  props: Pick<ComponentProps<typeof Thumbnail>, "size" | "src" | "alt">
) {
  return (
    <div className="p-6">
      <Thumbnail {...props} />
    </div>
  )
}

function AvatarHandlePreview(
  props: Pick<ComponentProps<typeof AvatarHandle>, "size" | "initials" | "src">
) {
  return (
    <div className="p-6">
      <AvatarHandle {...props} />
    </div>
  )
}

function WaveformPreview(
  props: Pick<ComponentProps<typeof Waveform>, "bars" | "progress">
) {
  return (
    <div className="overflow-x-auto p-6">
      <Waveform {...props} />
    </div>
  )
}

function SendButtonPreview(
  props: Pick<
    ComponentProps<typeof SendButton>,
    "disabled" | "loading" | "sound"
  >
) {
  return (
    <div className="p-6">
      <SendButton {...props} />
    </div>
  )
}

export const story = defineStory({
  Component: IconTilePreview,
  args: { initial: { size: 40, tone: "accent" } },
})
export const thumbnailStory = defineStory({
  Component: ThumbnailPreview,
  args: { initial: { size: "sm", alt: "Manuscript preview" } },
})
export const avatarHandleStory = defineStory({
  Component: AvatarHandlePreview,
  args: { initial: { size: 20, initials: "JD" } },
})
export const waveformStory = defineStory({
  Component: WaveformPreview,
  args: {
    initial: { progress: 4, bars: [0.3, 0.6, 1, 0.75, 0.45, 0.9, 0.55, 0.35] },
  },
})
export const sendButtonStory = defineStory({
  Component: SendButtonPreview,
  args: { initial: { disabled: false, loading: false, sound: true } },
})

export const Preview = story.WithControl
export const ThumbnailPreviewControl = thumbnailStory.WithControl
export const AvatarHandlePreviewControl = avatarHandleStory.WithControl
export const WaveformPreviewControl = waveformStory.WithControl
export const SendButtonPreviewControl = sendButtonStory.WithControl
