import * as React from "react"

import {
  DemoSelect,
  DemoStage,
  DemoToggle,
} from "@/components/docs/demo-controls"
import { Heading, Paragraph, Span, Text } from "@/components/atoms/text"
import type { SelectionRenderProps } from "@/components/atoms/text-selection"

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

export default function TextDemo(): React.ReactElement {
  const [type, setType] = React.useState<DemoType>("default")
  const [size, setSize] = React.useState<DemoSize>("medium")
  const [selection, setSelection] = React.useState(false)
  const renderSelectionPopover = React.useCallback(
    (props: SelectionRenderProps) => <SelectionPopoverContent {...props} />,
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
          <Span selection={selection} size="small">
            Small selected span
          </Span>
          <Text size="small" type="link" href="#text-demo">
            Link text
          </Text>
          <Text size="small" type="subscript">
            Subscript note
          </Text>
        </div>
      </div>
    </DemoStage>
  )
}
