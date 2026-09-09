import * as React from "react"
import { FileText } from "lucide-react"

import { DemoStage } from "@/components/docs/demo-controls"
import {
  AddButton,
  AvatarHandle,
  DurationPill,
  Favicon,
  FileTypeBadge,
  IconTile,
  PlayButton,
  QuoteRail,
  RemoveButton,
  SendButton,
  Thumbnail,
  Waveform,
} from "@/components/ui/chat"

export default function ChatAtomsDemo(): React.ReactElement {
  return (
    <DemoStage canvasClassName="flex min-h-24 w-full flex-wrap items-center justify-center gap-6 p-6">
      <IconTile>
        <FileText />
      </IconTile>
      <Thumbnail />
      <AvatarHandle initials="ED" />
      <RemoveButton />
      <PlayButton />
      <FileTypeBadge>PDF</FileTypeBadge>
      <Favicon />
      <Waveform />
      <span className="flex h-10"><QuoteRail /></span>
      <DurationPill>0:42</DurationPill>
      <SendButton />
      <AddButton />
    </DemoStage>
  )
}
