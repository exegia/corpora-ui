"use client"

import { useEffect } from "react"
import type { RefObject } from "react"

export type ReferenceShortcut = false | "focused" | "global"
interface ShortcutOwner {
  element: HTMLElement
  mode: ReferenceShortcut
  open: () => void
}
const owners = new WeakMap<Document, Map<symbol, ShortcutOwner>>()
/** One winner per document/event, even with multiple global opt-ins. */
export function useReferenceShortcut(
  ref: RefObject<HTMLElement | null>,
  mode: ReferenceShortcut,
  open: () => void
) {
  useEffect(() => {
    const element = ref.current
    if (!element || !mode) return
    const document = element.ownerDocument
    let registry = owners.get(document)
    if (!registry) {
      registry = new Map()
      owners.set(document, registry)
    }
    const key = Symbol()
    registry.set(key, { element, mode, open })
    function keydown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.altKey ||
        event.shiftKey ||
        !(event.metaKey || event.ctrlKey) ||
        event.key.toLowerCase() !== "k"
      )
        return
      const target = event.target instanceof Element ? event.target : null
      if (
        target?.closest(
          "input, textarea, select, [contenteditable='true'], [role='textbox']"
        )
      )
        return
      const candidates = [...registry!.values()]
      const winner =
        candidates.find((owner) =>
          (
            owner.element.closest("[data-corpus-navigator]") ?? owner.element
          ).contains(target)
        ) ?? candidates.find((owner) => owner.mode === "global")
      if (winner?.element !== element) return
      event.preventDefault()
      open()
    }
    document.addEventListener("keydown", keydown)
    return () => {
      registry!.delete(key)
      document.removeEventListener("keydown", keydown)
    }
  }, [ref, mode, open])
}
