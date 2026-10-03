"use client"

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useAtomValue, useSetAtom, useStore } from "jotai"
import type { PopoverRoot } from "@base-ui/react/popover"
import {
  anchoredPopoverOpenAtom,
  anchoredPopoverStateAtom,
  hideAnchoredPopoverAtom,
  removeAnchoredPopoverInstance,
  showAnchoredPopoverAtom,
} from "./anchored-popover-atom"
import type {
  IAnchorRect,
  IAnchoredPopoverContext,
  IUseAnchoredPopoverOptions,
  IUseAnchoredPopoverResult,
  TAnchorInput,
  TAnchoredPopoverReason,
  TAnchoredPopoverTrigger,
} from "./type"
import {
  closestMatch,
  isModifiedClick,
  rectToVirtualAnchor,
  selectionRangeWithin,
  toAnchorRect,
} from "./utils"

const NATIVE_INTERACTIVE = "button, a[href], input, textarea, select, summary"

/**
 * Opens a popover at a selection, a clicked element or a hovered element
 * inside the view behind `ref` — no `PopoverTrigger` wrapping required.
 * Spread `popoverProps` onto `<AnchoredPopover>` and render it anywhere.
 */
export function useAnchoredPopover<TPayload = unknown>(
  options: IUseAnchoredPopoverOptions<TPayload>
): IUseAnchoredPopoverResult<TPayload> {
  const {
    ref,
    id: idProp,
    trigger = "selection",
    match,
    getPayload,
    anchorTo = "target",
    minSelectionLength = 1,
    hoverDelay = 300,
    hoverCloseDelay = 150,
    onOpenChange,
  } = options
  const generatedId = useId()
  const id = idProp ?? generatedId
  const triggerKey = Array.isArray(trigger) ? trigger.join(",") : trigger
  const triggers = useMemo<TAnchoredPopoverTrigger[]>(
    // A fresh inline array each render must not re-bind listeners, so the
    // memo keys on the joined string rather than the array identity.
    () => triggerKey.split(",") as TAnchoredPopoverTrigger[],
    [triggerKey]
  )

  const store = useStore()
  const state = useAtomValue(anchoredPopoverStateAtom(id))
  const showInStore = useSetAtom(showAnchoredPopoverAtom(id))
  const hideInStore = useSetAtom(hideAnchoredPopoverAtom(id))

  // DOM-side state: never in the store.
  const [target, setTarget] = useState<Element | null>(null)
  // The live rect reader (an element's or range's own getBoundingClientRect)
  // is state, not a ref, because the anchor memo below reads it during render.
  const [liveRect, setLiveRect] = useState<(() => DOMRect | null) | null>(null)
  const targetRef = useRef<Element | null>(null)
  const reasonRef = useRef<TAnchoredPopoverReason | null>(null)
  const timers = useRef<{ open?: ReturnType<typeof setTimeout>; close?: ReturnType<typeof setTimeout> }>({})

  // Callbacks read through refs so the listeners below stay bound once; the
  // refs are synced after render (reading or writing them during render is
  // not allowed) and before any user event can reach a listener.
  const getPayloadRef = useRef(getPayload)
  const onOpenChangeRef = useRef(onOpenChange)
  useLayoutEffect(() => {
    getPayloadRef.current = getPayload
    onOpenChangeRef.current = onOpenChange
  })

  // The view element, captured once the ref is populated so the anchor memo
  // below never reads `ref.current` during render.
  const [view, setView] = useState<HTMLElement | null>(null)
  useLayoutEffect(() => {
    setView(ref.current)
  }, [ref])

  const isOpen = useCallback(() => store.get(anchoredPopoverOpenAtom(id)), [store, id])

  const openWith = useCallback(
    (
      rect: IAnchorRect,
      text: string,
      payload: unknown,
      nextTarget: Element | null,
      live: (() => DOMRect | null) | null,
      reason: TAnchoredPopoverReason
    ) => {
      targetRef.current = nextTarget
      reasonRef.current = reason
      setTarget(nextTarget)
      setLiveRect(() => live)
      showInStore({ rect, text, payload })
      onOpenChangeRef.current?.(true, reason)
    },
    [showInStore]
  )

  const close = useCallback(
    (reason: TAnchoredPopoverReason) => {
      if (!isOpen()) return
      hideInStore()
      targetRef.current = null
      reasonRef.current = null
      setTarget(null)
      onOpenChangeRef.current?.(false, reason)
    },
    [hideInStore, isOpen]
  )

  const clearTimers = useCallback(() => {
    clearTimeout(timers.current.open)
    clearTimeout(timers.current.close)
    timers.current = {}
  }, [])

  const resolvePayload = useCallback(
    (context: IAnchoredPopoverContext): unknown => getPayloadRef.current?.(context),
    []
  )

  /* ---------------------------------------------------------------- click */
  useLayoutEffect(() => {
    const view = ref.current
    if (!view || !triggers.includes("click")) return

    const openFrom = (matched: Element, event: MouseEvent | KeyboardEvent, reason: "click" | "keyboard") => {
      const text = matched.textContent ?? ""
      const payload = resolvePayload({ target: matched, text, event })
      // A resolver that answers null/undefined says "nothing to show here":
      // the popover stays closed and a link keeps navigating.
      if (getPayloadRef.current !== undefined && payload == null) return
      if (matched.closest("a[href]")) event.preventDefault()
      const rect =
        anchorTo === "pointer" && event instanceof MouseEvent
          ? toAnchorRect({ x: event.clientX, y: event.clientY })
          : toAnchorRect(matched)
      const live = anchorTo === "pointer" ? null : () => matched.getBoundingClientRect()
      openWith(rect, text, payload, matched, live, reason)
    }

    const onClick = (event: MouseEvent) => {
      if (isModifiedClick(event)) return
      const matched = closestMatch(event.target, match, view)
      if (!matched) return
      if (isOpen() && targetRef.current === matched) {
        close("toggle")
        return
      }
      openFrom(matched, event, "click")
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return
      const matched = closestMatch(event.target, match, view)
      // Native controls already turn Enter/Space into a click; let that path run.
      if (!matched || matched !== event.target || matched.matches(NATIVE_INTERACTIVE)) return
      event.preventDefault()
      if (isOpen() && targetRef.current === matched) {
        close("toggle")
        return
      }
      openFrom(matched, event, "keyboard")
    }

    view.addEventListener("click", onClick)
    view.addEventListener("keydown", onKeyDown)
    return () => {
      view.removeEventListener("click", onClick)
      view.removeEventListener("keydown", onKeyDown)
    }
  }, [ref, triggers, match, anchorTo, openWith, close, isOpen, resolvePayload])

  /* ---------------------------------------------------------------- hover */
  // TASK 4 fills this effect in.
  useLayoutEffect(() => {
    const view = ref.current
    if (!view || !triggers.includes("hover")) return
    return undefined
  }, [ref, triggers, match, anchorTo, hoverDelay, hoverCloseDelay, openWith, close, isOpen, resolvePayload, clearTimers])

  /* ------------------------------------------------------------ selection */
  // TASK 5 fills this effect in.
  useLayoutEffect(() => {
    const view = ref.current
    if (!view || !triggers.includes("selection")) return
    void selectionRangeWithin
    return undefined
  }, [ref, triggers, minSelectionLength, openWith, close, isOpen, resolvePayload])

  /* ----------------------------------------------------- lifecycle & api */
  useEffect(() => {
    return () => {
      clearTimers()
      // Unnamed instances die with the component; an explicit id persists.
      if (idProp === undefined) removeAnchoredPopoverInstance(id)
    }
  }, [clearTimers, id, idProp])

  const show = useCallback(
    (input: TAnchorInput, payload?: TPayload) => {
      const element = input instanceof Element ? input : null
      const live = element
        ? () => element.getBoundingClientRect()
        : input instanceof Range
          ? () => input.getBoundingClientRect()
          : null
      openWith(toAnchorRect(input), element?.textContent ?? "", payload, element, live, "show")
    },
    [openWith]
  )

  const hide = useCallback(() => close("hide"), [close])

  const handleOpenChange = useCallback(
    (next: boolean, details?: PopoverRoot.ChangeEventDetails) => {
      if (next) return
      if (details === undefined) {
        close("hide")
        return
      }
      // Base UI closes on pointerdown outside the popup. When that press lands
      // on a click/hover target the click handler owns the outcome (toggle or
      // switch), so the dismissal is cancelled here to avoid close-then-reopen.
      if (details.reason === "outside-press") {
        const view = ref.current
        const pressed = details.event?.target ?? null
        const handlesPress = triggers.includes("click") || triggers.includes("hover")
        if (view && handlesPress && closestMatch(pressed, match, view)) {
          details.cancel()
          return
        }
      }
      close("dismiss")
    },
    [close, match, ref, triggers]
  )

  const onPopupPointerEnter = useCallback(() => {
    clearTimeout(timers.current.close)
  }, [])

  const onPopupPointerLeave = useCallback(() => {
    if (reasonRef.current !== "hover") return
    clearTimeout(timers.current.close)
    timers.current.close = setTimeout(() => close("leave"), hoverCloseDelay)
  }, [close, hoverCloseDelay])

  const anchor = useMemo(
    () => (state.rect ? rectToVirtualAnchor(state.rect, view, liveRect ?? undefined) : null),
    [state.rect, view, liveRect]
  )

  const payload = state.payload as TPayload | undefined

  return {
    open: state.open,
    text: state.text,
    payload,
    target,
    anchor,
    show,
    hide,
    popoverProps: {
      id,
      open: state.open,
      anchor,
      text: state.text,
      payload,
      onOpenChange: handleOpenChange,
      onPopupPointerEnter,
      onPopupPointerLeave,
    },
  }
}
