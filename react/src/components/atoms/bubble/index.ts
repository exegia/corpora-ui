import { Bubble as BubbleRoot } from "./default"
import { useBubbleVariant } from "./context"
import { BubbleActions } from "./actions"
import { BubbleHeader } from "./header"
import { BubbleMessage } from "./message"
import {
  BubbleReactionChip,
  BubbleReactions,
} from "./reactions"
import { EmojiActionBar } from "./emoji-action-bar"

export const Bubble = Object.assign(BubbleRoot, {
  Header: BubbleHeader,
  Message: BubbleMessage,
  Reactions: BubbleReactions,
  Reaction: BubbleReactionChip,
  Actions: BubbleActions,
})

export {
  BubbleActions,
  EmojiActionBar,
  BubbleHeader,
  BubbleMessage,
  BubbleReactionChip,
  BubbleReactions,
  useBubbleVariant,
}

export { QUICK_REACTIONS } from "./utils"
export type { EmojiActionBarProps } from "./emoji-action-bar"

export type {
  BubbleActionsProps,
  BubbleAvatarIdentity,
  BubblePickedEmoji,
  BubbleHeaderProps,
  BubbleMessageProps,
  BubbleReactionChipProps,
  BubbleProps,
  BubbleReaction,
  BubbleReactionsProps,
  BubbleVariant,
} from "./types"
