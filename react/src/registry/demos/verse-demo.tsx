import * as React from "react"

import { DemoSelect, DemoStage } from "@/components/docs/demo-controls"
import { Verse, VerseNote, VerseSpan } from "@/components/composed/verse"

const SIZES = ["small", "medium", "large"] as const

type DemoSize = (typeof SIZES)[number]

function PopoverNote({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}): React.ReactElement {
  return (
    <div className="grid gap-1">
      <p className="text-[8px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-sm text-foreground">{children}</p>
    </div>
  )
}

export default function VerseDemo(): React.ReactElement {
  const [size, setSize] = React.useState<DemoSize>("medium")

  return (
    <DemoStage
      controls={
        <DemoSelect
          label="size"
          options={SIZES}
          value={size}
          onChange={setSize}
        />
      }
    >
      <div className="grid max-w-xl gap-5">
        <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
          Click the chapter reference, dotted spans or the note marker
        </p>
        <Verse
          chapter="1:1"
          chapterPopover={
            <PopoverNote label="Chapter">
              Genesis 1 — the creation account.
            </PopoverNote>
          }
          href="#verse-demo"
          size={size}
        >
          In the beginning{" "}
          <VerseSpan
            popover={
              <PopoverNote label="Term">
                Hebrew <em>bereshit</em> — “in beginning”, the opening word of
                the corpus.
              </PopoverNote>
            }
          >
            God created
          </VerseSpan>{" "}
          the heavens and the{" "}
          <VerseSpan
            popover={
              <PopoverNote label="Term">
                “Earth” here names the land as a whole, not a planet.
              </PopoverNote>
            }
          >
            earth
          </VerseSpan>
          <VerseNote
            popover={
              <PopoverNote label="Note a">
                Some manuscripts render this clause as a dependent temporal
                phrase.
              </PopoverNote>
            }
          >
            a
          </VerseNote>
          .
        </Verse>
      </div>
    </DemoStage>
  )
}
