"use client"

import { useMemo } from "react"
import type * as React from "react"
import { MoreHorizontal } from "lucide-react"
import { Action, EmojiAction, Separator } from "./action"
import ActionBar from "./toolbar"

import type { ActionKey, ActionMap, EmojiActionBarProps } from "./types"
import {
  EmojiPicker,
  EmojiPickerContent,
  // EmojiPickerFooter,
  EmojiPickerSearch,
} from "@/components/ui/emoji-picker"
import { isSeparator, QUICK_REACTIONS, useEmojiPicker } from "./utils"
import { GlassContainer } from "@/components/ui/glasscn/glass-container"

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
  const {
    actions: quickReactions,
    isFullPicker,
    togglePicker,
  } = useEmojiPicker({ onEmojiSelect, reactions, hideMore })

  const actions = useMemo(() => {
    return quickReactions.reduce<ActionMap<ActionKey>>((acc, item) => {
      // Replace spaces with hyphens and convert to lowercase for the action key
      const label = item.label.replace(/\s+/g, "-").toLowerCase()
      const key: ActionKey = `action-${label}` as const
      // Create the action component, using the more action if the label includes "more"
      const moreAction = (
        <Action
          Icon={MoreHorizontal}
          action={togglePicker}
          id={label}
          tooltip={item.label}
        />
      )
      const action = label.includes("more") ? (
        moreAction
      ) : (
        <EmojiAction
          emoji={item.emoji}
          label={item.label}
          action={() => onEmojiSelect?.(item)}
        />
      )
      // Store the action in the acc, using a separator if the key starts with "separator-"
      acc[key] = () => (isSeparator(key) ? <Separator /> : action)
      return acc
    }, {})
  }, [quickReactions, onEmojiSelect, togglePicker])

  return (
    <GlassContainer>
      {isFullPicker ? (
        <EmojiPicker
          className="h-[326px]"
          onEmojiSelect={({ emoji, label }) =>
            onEmojiSelect?.({ emoji, label })
          }
        >
          <EmojiPickerSearch />
          <EmojiPickerContent />
        </EmojiPicker>
      ) : (
        <ActionBar actions={actions} id="emoji-action-bar" variant="glass" />
      )}
    </GlassContainer>
  )
}
