import { useAtomValue, useSetAtom } from "jotai"
import { useCallback } from "react"

import type { ComposerAttachment } from "./type"
import {
  addComposerAttachmentAtom,
  clearComposerAttachmentsAtom,
  composerAttachmentsAtom,
  removeComposerAttachmentAtom,
} from "./utils"

/** Read the tray of one composer. */
export function useComposerAttachments(
  composerId: string
): ComposerAttachment[] {
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
