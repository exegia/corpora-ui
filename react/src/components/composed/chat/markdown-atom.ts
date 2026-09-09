import { useAtom } from "jotai"

import { createKeyedFamilies } from "@/lib/keyed-atom"

export type MarkdownView = "preview" | "markup"

const { stateFamily, removeInstance } = createKeyedFamilies("markdown")

/** Which pane a Markdown card shows, keyed by its `markdownId`; `null` until first toggled (the card then falls back to its `defaultView`). */
export const markdownViewAtom = stateFamily<MarkdownView | null>("view", null)
export const removeMarkdownInstance = removeInstance

export function useMarkdownView(markdownId: string) {
  return useAtom(markdownViewAtom(markdownId))
}
