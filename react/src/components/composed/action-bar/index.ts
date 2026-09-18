import { EmojiActionBar } from "./emojis"
import { Action, EmojiAction, Separator } from "./action"

import Toolbar from "./toolbar"

export { useActionBar, useEmojiPicker, QUICK_REACTIONS } from "./utils"
export type {
  IActionBarProps,
  TActionBarSegment,
  IActionButtonProps,
  IEmojiActionBarProps,
  TActionEntry,
  TActionItemsByGroup,
  TActionKey,
  TActionMap,
} from "./types"

export const ActionBar = {
  Emoji: EmojiActionBar,
  Separator,
  EmojiAction,
  Action,
}
export default Toolbar
