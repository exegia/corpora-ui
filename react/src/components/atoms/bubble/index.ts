import { Bubble as BubbleRoot } from "./default"
import { useBubbleVariant } from "./context"
import { BubbleActions } from "./actions"
import { BubbleHeader } from "./header"
import { BubbleMessage } from "./message"
import { Reference } from "./reference"
import {
  BubbleReactionChip,
  BubbleReactions,
} from "./reactions"

export const Bubble = Object.assign(BubbleRoot, {
  Header: BubbleHeader,
  Message: BubbleMessage,
  Reactions: BubbleReactions,
  Reaction: BubbleReactionChip,
  Actions: BubbleActions,
})

export {
  BubbleActions,
  BubbleHeader,
  BubbleMessage,
  BubbleReactionChip,
  BubbleReactions,
  Reference,
  useBubbleVariant,
}


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
  ReferenceProps,
} from "./types"
