"use client"

import { useMemo } from "react"
import type * as React from "react"
import { MoreHorizontal, X } from "lucide-react"
import { Action, EmojiAction, Separator } from "./action"
import { motion } from "motion/react"
import ActionBar from "./toolbar"
import { BOUNCE_IN_OUT } from "@/lib/ease"

import type { ActionKey, ActionMap, EmojiActionBarProps } from "./types"
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
} from "@/components/ui/emoji-picker"
import { isSeparator, QUICK_REACTIONS, useEmojiPicker } from "./utils"
import { Button } from "@/components/ui/button";

/**
 * Compact reaction picker: a toolbar of quick emoji, then a "More" action that
 * swaps the surface for the full frimousse picker. Meant to sit inside a
 * `PopoverGlass variant="glass"` — swapping the two surfaces resizes the popup,
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
    selectEmoji,
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
          action={() => selectEmoji(item)}
        />
      )
      // Store the action in the acc, using a separator if the key starts with "separator-"
      acc[key] = () => (isSeparator(key) ? <Separator /> : action)
      return acc
    }, {})
  }, [quickReactions, selectEmoji, togglePicker])

  return (
    <motion.div className="relative" initial={{ height: "auto" }} exit={{ height: "auto" }} animate={{ height: isFullPicker ? 326 : "auto" }} transition={BOUNCE_IN_OUT}>
     
      {isFullPicker ? (
        <EmojiPicker
          className="h-full relative"
          onEmojiSelect={selectEmoji}
        >
          <div className="flex items-center">
               <EmojiPickerSearch />
            <Button variant="secondary" size="icon-xs" onClick={togglePicker}>
              <X className="size-3 stroke-3" />
            </Button>
          </div>
       
          <EmojiPickerContent />
          <EmojiPickerFooter />
        </EmojiPicker>
      ) : (
        <ActionBar
          actions={actions}
          id="emoji-action-bar"
          variant="default"
          className="pr-3 pl-1.5"
        />
      )}
    </motion.div>
  )
}
