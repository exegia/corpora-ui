"use client"

import * as React from "react"

import { DemoStage } from "@/components/docs/demo-controls"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverGlass,
  PopoverTrigger,
} from "@/components/ui/popover-glass"
import type { Emoji } from "frimousse"
import { ActionBar, QUICK_REACTIONS } from "@/components/composed/action-bar"

/**
 * The picker paints its own bg-popover on the root and on each sticky category
 * header, and the popup's viewport subtracts an inline-padding variable that
 * has to be zeroed — the same overrides `BubbleReactions` ships with.
 */

export default function EmojiActionBarDemo() {
  const [open, setOpen] = React.useState(false)
  const [picked, setPicked] = React.useState<Emoji | null>(null)

  const onEmojiSelect = (next: Emoji) => {
    setPicked(next)
    setOpen(false)
  }

  return (
    <DemoStage>
      <div className="gap-6 flex w-full flex-col items-center">
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger
            render={<Button variant="outline">Add reaction</Button>}
          />

          <PopoverGlass glassVariant="frosted" side="top">
            <ActionBar.Emoji onEmojiSelect={onEmojiSelect} />
          </PopoverGlass>
        </Popover>

        <p className="text-sm text-muted-foreground">
          {picked ? (
            <>
              Picked <span className="text-base">{picked.emoji}</span>{" "}
              <code>{picked.label}</code>
            </>
          ) : (
            <>
              {QUICK_REACTIONS.length} quick reactions, then More opens the full
              picker
            </>
          )}
        </p>
      </div>
    </DemoStage>
  )
}
