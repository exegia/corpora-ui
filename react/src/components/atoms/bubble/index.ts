import { Bubble as BubbleRoot } from "./default"
import { useBubbleVariant } from "./context"
import { BubbleActions } from "./actions"
import { BubbleMessage } from "./message"
import { BubbleReactions } from "./reactions"

export const Bubble = Object.assign(BubbleRoot, {
  Message: BubbleMessage,
  Reactions: BubbleReactions,
  Actions: BubbleActions,
})

export { BubbleActions, BubbleMessage, BubbleReactions, useBubbleVariant }
export type {
  BubbleActionsProps,
  BubbleMessageProps,
  BubbleProps,
  BubbleReaction,
  BubbleReactionsProps,
  BubbleVariant,
} from "./types"
