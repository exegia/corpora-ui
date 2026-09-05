import * as React from "react"

import { EmojiActionBar, QUICK_REACTIONS } from "@/components/atoms"
import type { BubblePickedEmoji } from "@/components/atoms"
import { DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverPopup,
  PopoverTrigger,
} from "@/components/ui/popover-popup"

/**
 * The picker paints its own bg-popover on the root and on each sticky category
 * header, and the popup's viewport subtracts an inline-padding variable that
 * has to be zeroed — the same overrides `BubbleReactions` ships with.
 */
const PICKER_ON_GLASS =
  "w-fit [&_[data-slot=emoji-picker-category-header]]:bg-white/65 [&_[data-slot=emoji-picker-category-header]]:backdrop-blur-sm [&_[data-slot=emoji-picker]]:bg-transparent [&_[data-slot=popover-viewport]]:[--viewport-inline-padding:0px] [&_[data-slot=popover-viewport]]:max-h-none [&_[data-slot=popover-viewport]]:overflow-clip [&_[data-slot=popover-viewport]]:py-0 dark:[&_[data-slot=emoji-picker-category-header]]:bg-black/55"

const DEFAULT_BG =
  "w-fit [&_[data-slot=popover-viewport]]:[--viewport-inline-padding:0px] [&_[data-slot=popover-viewport]]:max-h-none [&_[data-slot=popover-viewport]]:overflow-clip [&_[data-slot=popover-viewport]]:py-0"

export default function EmojiActionBarDemo() {
  const [glass, setGlass] = React.useState(true)
  const [more, setMore] = React.useState(true)
  const [open, setOpen] = React.useState(false)
  const [picked, setPicked] = React.useState<BubblePickedEmoji | null>(null)

  const onEmojiSelect = (next: BubblePickedEmoji) => {
    setPicked(next)
    setOpen(false)
  }

  return (
    <DemoStage
      controls={
        <>
          <DemoToggle checked={glass} label="glass" onChange={setGlass} />
          <DemoToggle checked={more} label="more" onChange={setMore} />
        </>
      }
    >
      <div className="flex w-full flex-col items-center gap-6">
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger
            render={<Button variant="outline">Add reaction</Button>}
          />

          <PopoverPopup
            className={glass ? PICKER_ON_GLASS : DEFAULT_BG}
            glassVariant="liquid"
            side="top"
            variant="glass"
          >
            <EmojiActionBar hideMore={!more} onEmojiSelect={onEmojiSelect} />
          </PopoverPopup>
        </Popover>

        <p className="text-sm text-muted-foreground">
          {picked ? (
            <>
              Picked <span className="text-base">{picked.emoji}</span>{" "}
              <code>{picked.label}</code>
            </>
          ) : (
            <>
              {QUICK_REACTIONS.length} quick reactions
              {more ? ", then More opens the full picker" : ""}
            </>
          )}
        </p>
      </div>
    </DemoStage>
  )
}
