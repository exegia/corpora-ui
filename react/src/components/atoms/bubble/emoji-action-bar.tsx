"use client"

import { useState } from "react"
import type * as React from "react"
import { SmilePlusIcon } from "lucide-react"
import { ActionBar, EmojiAction, Separator } from "@/components/composed/action-bar"
import type { ActionKey, ActionMap } from "@/components/composed/action-bar"
import { Action } from "@/components/composed/action-bar"
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
} from "@/components/ui/emoji-picker"
import type { BubblePickedEmoji } from "./types"
import { QUICK_REACTIONS } from "./utils"

export interface EmojiActionBarProps {
  /** Fires for both a quick reaction and a pick from the full picker. */
  onEmojiSelect?: (emoji: BubblePickedEmoji) => void
  /** Quick row contents. Defaults to {@link QUICK_REACTIONS}. */
  reactions?: readonly BubblePickedEmoji[]
  /** Hides the trailing "More" action, leaving the quick row only. */
  hideMore?: boolean
}

/**
 * Compact reaction picker: a toolbar of quick emoji, then a "More" action that
 * swaps the surface for the full frimousse picker. Meant to sit inside a
 * `PopoverPopup variant="glass"` — swapping the two surfaces resizes the popup,
 * which is why the popup's viewport padding variable has to be zeroed rather
 * than only its padding (see `BubbleReactionsButton`).
 */
export function EmojiActionBar({
  onEmojiSelect,
  reactions = QUICK_REACTIONS,
  hideMore = false,
}: EmojiActionBarProps): React.ReactElement {
  const [showAll, setShowAll] = useState(false)

  if (showAll) {
    return (
      <EmojiPicker
        className="h-[326px]"
        onEmojiSelect={({ emoji, label }) => onEmojiSelect?.({ emoji, label })}
      >
        <EmojiPickerSearch />
        <EmojiPickerContent />
        <EmojiPickerFooter />
      </EmojiPicker>
    )
  }

  const actions = {
    ...Object.fromEntries(
      reactions.map(({ emoji, label }) => [
        `action-${label.replace(/\s+/g, "-")}`,
        () => (
          <EmojiAction
            action={() => onEmojiSelect?.({ emoji, label })}
            emoji={emoji}
            label={label}
          />
        ),
      ])
    ),
    ...(hideMore
      ? {}
      : {
          "separator-more": Separator,
          "action-more": () => (
            <Action
              Icon={SmilePlusIcon}
              action={() => setShowAll(true)}
              id="more"
              tooltip="More emoji"
            />
          ),
        }),
  } as ActionMap<ActionKey>

  return (
    <ActionBar
      actions={actions}
      id="emoji-action-bar"
      variant="glass"
    />
  )
}
