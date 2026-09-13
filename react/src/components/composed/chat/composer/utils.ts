/**
 * Per-instance attachment tray for `Composer`, keyed by composer id
 * so an app can add or remove chips without holding the component.
 */
import { createKeyedFamilies } from "@/lib/keyed-atom"
import type { ComposerAttachment } from "./type"
import { Children, Fragment, isValidElement } from "react";
import type { Variants } from "motion";
import { EASE_IN_OUT, SPRING_PANEL } from "@/lib/ease";

const { stateFamily, actionFamily, removeInstance } =
  createKeyedFamilies("composer")

const NO_ITEMS: ComposerAttachment[] = []

export const composerAttachmentsAtom = stateFamily<ComposerAttachment[]>(
  "attachments",
  NO_ITEMS
)

export const addComposerAttachmentAtom = actionFamily(
  "add",
  (get, set, id, item: ComposerAttachment) => {
    const items = get(composerAttachmentsAtom(id))
    if (items.some((i) => i.id === item.id)) return
    set(composerAttachmentsAtom(id), [...items, item])
  }
)

export const removeComposerAttachmentAtom = actionFamily(
  "remove",
  (get, set, id, itemId: string) => {
    set(
      composerAttachmentsAtom(id),
      get(composerAttachmentsAtom(id)).filter((i) => i.id !== itemId)
    )
  }
)

export const clearComposerAttachmentsAtom = actionFamily(
  "clear",
  (_get, set, id) => {
    set(composerAttachmentsAtom(id), NO_ITEMS)
  }
)

export const removeComposerInstance = removeInstance

/** Children.toArray, but looking through fragments so `<>{a}{b}</>` counts two. */
export function flattenChildren(children: React.ReactNode): React.ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: React.ReactNode }>(child) && child.type === Fragment
      ? flattenChildren(child.props.children)
      : [child]
  )
}

// The suggestions fan-out: the list holds the stagger, each item springs up
// into place. Shared by `AiMessage`'s disclosure and `SuggestedPrompts`, so
// both fan out with the same rhythm.
export const LIST_VARIANTS: Variants = {
  hidden: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

export const ITEM_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
    scale: 0.97,
    transition: { duration: 0.18, ease: EASE_IN_OUT },
  },
  visible: { opacity: 1, y: 0, scale: 1, transition: SPRING_PANEL },
}