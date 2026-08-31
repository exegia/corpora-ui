import * as React from "react"

import {
  DemoSelect,
  DemoStage,
  DemoToggle,
} from "@/components/docs/demo-controls"
import { Heading, Paragraph, Text } from "@/components/atoms/text"
import { TextClickPopover } from "@/components/atoms/text-selection"
import type {
  SelectionRenderProps,
  TextPopoverRenderProps,
} from "@/components/atoms/text-selection"

const TYPES = ["default", "heading", "paragraph", "link", "subscript"] as const
const SIZES = ["small", "medium", "large"] as const

type DemoType = (typeof TYPES)[number]
type DemoSize = (typeof SIZES)[number]

function SelectionPopoverContent({
  selection,
}: SelectionRenderProps): React.ReactElement {
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[8px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Selected text
        </p>
        <p className="text-sm text-ellipsis text-foreground">{selection}</p>
      </div>
    </div>
  )
}

function ClickPopoverContent({ close }: TextPopoverRenderProps) {
  return (
    <div className="grid gap-1">
      <p className="text-[8px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        Clicked text
      </p>
      <p className="text-sm text-foreground">
        Rendered from a coss Popover on click.
      </p>
      <button
        className="justify-self-start text-xs text-primary hover:text-primary/80"
        onClick={close}
        type="button"
      >
        Dismiss
      </button>
    </div>
  )
}

export default function TextDemo(): React.ReactElement {
  const [type, setType] = React.useState<DemoType>("default")
  const [size, setSize] = React.useState<DemoSize>("medium")
  const [selection, setSelection] = React.useState(false)
  const renderSelectionPopover = React.useCallback(
    (props: SelectionRenderProps) => <SelectionPopoverContent {...props} />,
    []
  )
  const renderClickPopover = React.useCallback(
    (props: TextPopoverRenderProps) => <ClickPopoverContent {...props} />,
    []
  )

  return (
    <DemoStage
      controls={
        <>
          <DemoSelect
            label="type"
            options={TYPES}
            value={type}
            onChange={setType}
          />
          <DemoSelect
            label="size"
            options={SIZES}
            value={size}
            onChange={setSize}
          />
          <DemoToggle
            checked={selection}
            label="selection"
            onChange={setSelection}
          />
        </>
      }
    >
      <div className="grid max-w-xl gap-5">
        <Text selection={selection} size={size} type={type}>
          A reusable text primitive for corpus prose and interface copy.
        </Text>
        <div className="grid gap-3 border-t pt-4 text-muted-foreground">
          <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
            Select words in either text block to open its popover
          </p>
          <Heading
            renderPopover={renderSelectionPopover}
            selection={selection}
            size="large"
          >
            Select this heading to inspect the current selection.
          </Heading>
          <Paragraph
            renderPopover={renderSelectionPopover}
            selection={selection}
            size="medium"
          >
            This paragraph forwards the selection wrapper props, so selecting
            any part of it renders the preview popover above.
          </Paragraph>
          <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
            Click any of the texts below to open its popover
          </p>
          <TextClickPopover
            className="select-text"
            renderPopover={renderClickPopover}
            size="small"
          >
            Small selected span
          </TextClickPopover>
          <TextClickPopover
            renderPopover={renderClickPopover}
            size="small"
            type="link"
          >
            Link text
          </TextClickPopover>
          <TextClickPopover
            renderPopover={renderClickPopover}
            size="small"
            type="subscript"
          >
            Subscript note
          </TextClickPopover>
        </div>
      </div>
    </DemoStage>
  )
}
