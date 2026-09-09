import * as React from "react"
import { Copy } from "lucide-react"

import { DemoStage } from "@/components/docs/demo-controls"
import {
  AgentBadge,
  AvatarStack,
  Dot,
  FollowUpRow,
  IconButton,
  LegendItem,
  Pill,
  SegmentedToggle,
  Signal,
  SourceChip,
  Stat,
  Tag,
} from "@/components/ui/chat"

const VIEWS = [{ value: "preview", label: "Preview" }, { value: "markup", label: "Markup" }] as const

export default function ChatPresentationAtomsDemo(): React.ReactElement {
  return (
    <DemoStage canvasClassName="flex min-h-24 w-full flex-col items-center gap-5 p-6">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <SegmentedToggle label="View" options={VIEWS} defaultValue="preview" />
        <IconButton aria-label="Copy"><Copy /></IconButton>
        <AgentBadge />
        <Pill>Bar</Pill>
        <LegendItem tone="series-1">Nodes</LegendItem>
        <Dot tone="success" /><Dot tone="warning" /><Dot tone="info" /><Dot tone="danger" /><Dot tone="neutral" /><Dot tone="accent" /><Dot tone="brand" /><Dot tone="series-3" /><Dot tone="series-4" />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Tag tone="amber">Trigger</Tag><Tag tone="purple">Gelato</Tag><Tag tone="blue">Retail</Tag><Tag tone="green">Active</Tag>
        <Signal level="high" /><Signal level="medium" /><Signal level="low" />
        <SourceChip>scoopdata.io</SourceChip>
        <AvatarStack />
      </div>
      <div className="flex gap-4">
        <Stat tone="series-1" label="Mint Chip" value="-4.41%" delta="-$2,377.66" trend="negative" />
        <Stat tone="series-3" label="Pistachio" value="+1.15%" delta="+$617.22" trend="positive" />
      </div>
      <div className="w-[380px]">
        <FollowUpRow>Which flavors sell best in winter</FollowUpRow>
        <FollowUpRow>Compare gelato and soft serve margins</FollowUpRow>
      </div>
    </DemoStage>
  )
}
