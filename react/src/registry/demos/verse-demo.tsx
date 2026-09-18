"use client"

import * as React from "react"

import { DemoStage } from "@/components/docs/demo-controls"
import { Verse, VerseNote, VerseSpan } from "@/components/composed/verse"

function PopoverNote({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}): React.ReactElement {
  return (
    <div className="gap-1 grid">
      <p className="font-medium text-[8px] tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-sm text-foreground">{children}</p>
    </div>
  )
}

export default function VerseDemo(): React.ReactElement {
  return (
    <DemoStage>
      <div className="max-w-xl gap-5 grid">
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
          size="medium"
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
