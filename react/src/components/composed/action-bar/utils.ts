import { type ComponentType, useMemo, useState } from "react"
import { Tooltip } from "@base-ui/react/tooltip"
import { TooltipCreateHandle } from "@/components/ui/tooltip"
import type {
  ActionBarSegment,
  ActionEntry,
  ActionItemsByGroup,
  ActionKey,
  ActionMap,
  EmojiActionBarProps,
} from "./types"
import type { Emoji } from "frimousse"

// Annotated, not inferred: the emitted .d.ts cannot name base-ui's
// `TooltipHandle` on its own (TS2883).
export const tooltipHandle: Tooltip.Handle<ComponentType> =
  TooltipCreateHandle<ComponentType>()

export const isSeparator = (key: string): boolean => key.includes("separator")

/**
 * Splits `actions` into render-ready segments at every `separator-*` key.
 *
 * Order comes from the map's insertion order (see `ActionMap`) — the grouping
 * is positional, so actions written before a separator group ahead of it.
 * Empty groups are dropped, which is what keeps a leading, trailing or
 * doubled separator from rendering a `ToolbarGroup` with nothing in it.
 */
export const useActionBar = ({
  actions,
}: {
  actions: ActionMap<ActionKey>
}) => {
  return useMemo(() => {
    const entries = Object.entries(actions) as ActionEntry[]
    const segments: ActionBarSegment[] = []
    let open: ActionEntry[] = []

    const closeGroup = (): void => {
      if (open.length === 0) return
      segments.push({ type: "group", key: `group-${open[0][0]}`, items: open })
      open = []
    }

    for (const entry of entries) {
      const [key, Item] = entry
      if (isSeparator(key)) {
        closeGroup()
        segments.push({ type: "separator", key, Separator: Item })
        continue
      }
      open.push(entry)
    }
    closeGroup()

    const groups = segments.filter((s) => s.type === "group")

    // A bar with no separators renders flat — `ToolbarGroup` is only added
    // once the caller has actually asked for grouping.
    const hasGroups = segments.some((s) => s.type === "separator")

    const actionItemsByGroup: ActionItemsByGroup = Object.fromEntries(
      groups.map((group) => [group.key, group.items])
    )

    return {
      segments,
      entries,
      hasGroups,
      groupsCount: groups.length,
      separatorCount: segments.length - groups.length,
      actionItemsByGroup,
    }
  }, [actions])
}

/**
 * The quick row. frimousse has no way to render a subset — `EmojiPicker.Root`
 * takes `columns`/`skinTone`/`locale`/`emojiVersion`/`emojibaseUrl`/`sticky`
 * and nothing else, and its list is virtualized on fixed-height rows, so a
 * custom `Emoji` component that returns null leaves holes rather than a short
 * row. A fixed list is the only way to show just these, and it costs no
 * network request — the CDN fetch only happens if "More" is opened.
 */
export const QUICK_REACTIONS: readonly Emoji[] = [
  { emoji: "❤️", label: "heart" },
  { emoji: "👍", label: "thumbs up" },
  { emoji: "😊", label: "smiling face" },
  { emoji: "😂", label: "face with tears of joy" },
  { emoji: "🎉", label: "party popper" },
  { emoji: "🙏", label: "folded hands" },
]

/**
 * Hook for managing the emoji picker state and actions.
 *
 * @param props - The emoji picker props.
 * @returns The emoji picker state and actions.
 *
 * @example
 * ```tsx
 * const { isFullPicker, quickReactions, actions, togglePicker, selectEmoji } = useEmojiPicker({ onEmojiSelect });
 * ```
 */
export const useEmojiPicker = ({
  onEmojiSelect,
  reactions,
  hideMore,
}: EmojiActionBarProps) => {
  const [isFullPicker, setShowAll] = useState(false)

  // Toggles the picker between quick reactions and the full picker.
  const togglePicker = () => setShowAll((previous) => !previous)
  /**
   * Reports the pick and folds the full picker back to the quick row. The bar
   * lives inside a `keepMounted` popover, so it is never unmounted on close —
   * without this reset the next open would still show the full picker.
   */
  const selectEmoji = (emoji: Emoji): void => {
    setShowAll(false)
    onEmojiSelect?.(emoji)
  }
  // The quick reactions to display.
  const quickReactions = reactions ?? QUICK_REACTIONS
  const actions = useMemo(() => {
    if (hideMore) return quickReactions
    return [
      ...quickReactions,
      { emoji: "Separator", label: "separator" },
      { emoji: "More", label: "More emoji" },
    ]
  }, [quickReactions, hideMore])

  return {
    isFullPicker,
    quickReactions,
    actions,
    togglePicker,
    selectEmoji,
  }
}
