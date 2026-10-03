"use client"

import * as React from "react"

import { DemoSelect, DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import { Text } from "@/components/atoms/text"
import { AnchoredPopover, useAnchoredPopover } from "@/components/atoms/text/selection"

const TYPES = ["default", "heading", "paragraph", "link", "subscript"] as const
const SIZES = ["small", "medium", "large"] as const

type TDemoType = (typeof TYPES)[number]
type TDemoSize = (typeof SIZES)[number]

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[8px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
      {children}
    </p>
  )
}

function Term({ children, term }: { children: React.ReactNode; term: string }) {
  return (
    <span
      className="cursor-pointer underline decoration-dotted underline-offset-4"
      data-term={term}
      role="button"
      tabIndex={0}
    >
      {children}
    </span>
  )
}

export default function TextDemo(): React.ReactElement {
  const [type, setType] = React.useState<TDemoType>("default")
  const [size, setSize] = React.useState<TDemoSize>("medium")
  const [selection, setSelection] = React.useState(false)

  // One view, two triggers: select any text, or click a marked term.
  const ref = React.useRef<HTMLDivElement>(null)
  const popover = useAnchoredPopover<string | null>({
    ref,
    trigger: ["selection", "click"],
    match: "[data-term]",
    getPayload: ({ target }) => (target as HTMLElement | null)?.dataset.term ?? null,
    minSelectionLength: 2,
  })

  return (
    <DemoStage
      controls={
        <>
          <DemoSelect label="type" options={TYPES} value={type} onChange={setType} />
          <DemoSelect label="size" options={SIZES} value={size} onChange={setSize} />
          <DemoToggle checked={selection} label="selection" onChange={setSelection} />
        </>
      }
    >
      <div className="grid max-w-xl gap-5">
        <Text.Root selection={selection} size={size} type={type}>
          A reusable text primitive for corpus prose and interface copy.
        </Text.Root>
        <div className="grid gap-3 border-t pt-4 text-muted-foreground" ref={ref}>
          <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
            Select words in either block, or click a dotted term
          </p>
          <Text.Heading size="large">Select this heading to inspect the current selection.</Text.Heading>
          <Text.Paragraph size="medium">
            This paragraph sits in the same view, so selecting any part of it opens the popover
            above the selection, and clicking <Term term="lemma">lemma</Term> or{" "}
            <Term term="apparatus">apparatus</Term> opens it on the word instead.
          </Text.Paragraph>
        </div>
        <AnchoredPopover {...popover.popoverProps} variant="glass">
          {({ text, payload, close }) => (
            <div className="grid gap-1">
              <Caption>{payload ? "Clicked term" : "Selected text"}</Caption>
              <p className="text-sm text-foreground">{payload ?? text}</p>
              <button
                className="justify-self-start text-xs text-primary hover:text-primary/80"
                onClick={close}
                type="button"
              >
                Dismiss
              </button>
            </div>
          )}
        </AnchoredPopover>
      </div>
    </DemoStage>
  )
}
