/**
 * Per-instance attachment tray for `Composer`, keyed by composer id
 * so an app can add or remove chips without holding the component.
 */
import { useAtomValue, useSetAtom } from "jotai"
import { useCallback } from "react"

import { createKeyedFamilies } from "@/lib/keyed-atom"
import type { AttachmentProps } from "@/components/composed/chat"

/** A tray chip: any Attachment kind plus a stable id. */
export type ComposerAttachment = Omit<AttachmentProps, "variant" | "onRemove" | "removable"> & { id: string }

const { stateFamily, actionFamily, removeInstance } = createKeyedFamilies("composer")

const NO_ITEMS: ComposerAttachment[] = []

export const composerAttachmentsAtom = stateFamily<ComposerAttachment[]>("attachments", NO_ITEMS)

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
    set(composerAttachmentsAtom(id), get(composerAttachmentsAtom(id)).filter((i) => i.id !== itemId))
  }
)

export const clearComposerAttachmentsAtom = actionFamily("clear", (_get, set, id) => {
  set(composerAttachmentsAtom(id), NO_ITEMS)
})

export const removeComposerInstance = removeInstance

/** Read the tray of one composer. */
export function useComposerAttachments(composerId: string): ComposerAttachment[] {
  return useAtomValue(composerAttachmentsAtom(composerId))
}

/** Write-only tray actions; never re-renders the caller when the tray changes. */
export function useComposerAttachmentActions(composerId: string) {
  const add = useSetAtom(addComposerAttachmentAtom(composerId))
  const remove = useSetAtom(removeComposerAttachmentAtom(composerId))
  const clear = useSetAtom(clearComposerAttachmentsAtom(composerId))
  return {
    add: useCallback((item: ComposerAttachment) => add(item), [add]),
    remove: useCallback((itemId: string) => remove(itemId), [remove]),
    clear: useCallback(() => clear(), [clear]),
  }
}
