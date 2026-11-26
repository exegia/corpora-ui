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

type TLiveRect = (() => DOMRect | null) | null

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
  // and the rect snapshot it belongs to. Both are state because the anchor
  // memo below reads them during render; the pairing lets a remote `show()`
  // (a new rect in the store, no live reader) win over a stale reader.
  const [live, setLive] = useState<{ read: TLiveRect; rect: IAnchorRect | null }>({ read: null, rect: null })
  const [reason, setReason] = useState<TAnchoredPopoverReason | null>(null)
  const targetRef = useRef<Element | null>(null)
  const reasonRef = useRef<TAnchoredPopoverReason | null>(null)
  const timers = useRef<{ open?: ReturnType<typeof setTimeout>; close?: ReturnType<typeof setTimeout> }>({})

  // Options read through refs so the listeners below stay bound once; the
  // refs are synced after render (reading or writing them during render is
  // not allowed) and before any user event can reach a listener. `match` is
  // here too: an inline predicate is a new identity every render, and
  // re-binding the hover listeners would cancel its pending open timer.
  const getPayloadRef = useRef(getPayload)
  const onOpenChangeRef = useRef(onOpenChange)
  const matchRef = useRef(match)
  useLayoutEffect(() => {
    getPayloadRef.current = getPayload
    onOpenChangeRef.current = onOpenChange
    matchRef.current = match
  })

  // The view element, captured into state so the effects below key on it:
  // a view that mounts after the hook (or is swapped) re-binds its listeners,
  // and the anchor memo never reads `ref.current` during render. No deps on
  // purpose — the ref can change on any commit; the guard keeps it settled.
  const [view, setView] = useState<HTMLElement | null>(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- see above
  useLayoutEffect(() => {
    if (ref.current !== view) setView(ref.current)
  })

  const isOpen = useCallback(() => store.get(anchoredPopoverOpenAtom(id)), [store, id])

  const openWith = useCallback(
    (
      rect: IAnchorRect,
      text: string,
      payload: unknown,
      nextTarget: Element | null,
      read: TLiveRect,
      nextReason: TAnchoredPopoverReason
    ) => {
      targetRef.current = nextTarget
      reasonRef.current = nextReason
      setTarget(nextTarget)
      setLive({ read, rect })
      setReason(nextReason)
      showInStore({ rect, text, payload })
      onOpenChangeRef.current?.(true, nextReason)
    },
    [showInStore]
  )

  const close = useCallback(
    (closeReason: TAnchoredPopoverReason) => {
      if (!isOpen()) return
      hideInStore()
      targetRef.current = null
      reasonRef.current = null
      setTarget(null)
      onOpenChangeRef.current?.(false, closeReason)
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

  /**
   * A point anchor is remembered as an offset inside the view, so the popup
   * follows the text through scroll and reflow like an element anchor does.
   */
  const pointAnchor = useCallback(
    (point: { x: number; y: number }, container: HTMLElement): { rect: IAnchorRect; read: TLiveRect } => {
      const origin = container.getBoundingClientRect()
      const dx = point.x - origin.left
      const dy = point.y - origin.top
      return {
        rect: toAnchorRect(point),
        read: () => {
          if (!container.isConnected) return null
          const now = container.getBoundingClientRect()
          const x = now.left + dx
          const y = now.top + dy
          return { x, y, width: 0, height: 0, top: y, left: x, right: x, bottom: y, toJSON: () => ({ x, y }) } as DOMRect
        },
      }
    },
    []
  )

  const elementAnchor = useCallback((element: Element): { rect: IAnchorRect; read: TLiveRect } => {
    return {
      rect: toAnchorRect(element),
      read: () => (element.isConnected ? element.getBoundingClientRect() : null),
    }
  }, [])

  /* ---------------------------------------------------------------- click */
  useLayoutEffect(() => {
    if (!view || !triggers.includes("click")) return

    const openFrom = (matched: Element, event: MouseEvent | KeyboardEvent, openReason: "click" | "keyboard") => {
      const text = matched.textContent ?? ""
      const payload = resolvePayload({ target: matched, text, event })
      // A resolver that answers null/undefined says "nothing to show here":
      // the popover stays closed and a link keeps navigating.
      if (getPayloadRef.current !== undefined && payload == null) return
      if (matched.closest("a[href]")) event.preventDefault()
      const { rect, read } =
        anchorTo === "pointer" && event instanceof MouseEvent
          ? pointAnchor({ x: event.clientX, y: event.clientY }, view)
          : elementAnchor(matched)
      openWith(rect, text, payload, matched, read, openReason)
    }

    const onClick = (event: MouseEvent) => {
      if (isModifiedClick(event)) return
      // Browsers fire `click` on the element where a drag-selection ended;
      // with text still selected inside the view that click is the end of a
      // selection gesture, not a press, so it must not toggle or replace.
      if (selectionRangeWithin(view)) return
      const matched = closestMatch(event.target, matchRef.current, view)
      if (!matched) return
      if (isOpen() && targetRef.current === matched) {
        close("toggle")
        return
      }
      openFrom(matched, event, "click")
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return
      const matched = closestMatch(event.target, matchRef.current, view)
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
  }, [view, triggers, anchorTo, openWith, close, isOpen, resolvePayload, pointAnchor, elementAnchor])

  /* ---------------------------------------------------------------- hover */
  useLayoutEffect(() => {
    if (!view || !triggers.includes("hover")) return
    let pointer = { x: 0, y: 0 }
    // The target whose open timer is running, and whether the pointer is
    // still over it. Moving between a target's own children must not restart
    // the delay, and `relatedTarget` is not always reliable, so the timer
    // is never cancelled by a leave — it checks `over` when it fires.
    let pendingTarget: Element | null = null
    let over = false

    const onPointerMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY }
    }

    const onPointerOver = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY }
      clearTimeout(timers.current.close)
      const matched = closestMatch(event.target, matchRef.current, view)
      if (!matched) return
      over = true
      if (isOpen() && targetRef.current === matched) return
      if (pendingTarget === matched) return
      clearTimeout(timers.current.open)
      pendingTarget = matched
      timers.current.open = setTimeout(() => {
        pendingTarget = null
        if (!over) return
        const text = matched.textContent ?? ""
        const payload = resolvePayload({ target: matched, text, event })
        if (getPayloadRef.current !== undefined && payload == null) return
        // The point is where the pointer rests when the delay ends, not where it entered.
        const { rect, read } = anchorTo === "pointer" ? pointAnchor(pointer, view) : elementAnchor(matched)
        openWith(rect, text, payload, matched, read, "hover")
      }, hoverDelay)
    }

    const onPointerOut = (event: PointerEvent) => {
      const related = event.relatedTarget
      const current = targetRef.current ?? closestMatch(event.target, matchRef.current, view)
      // Moving between the target's own children is not a leave.
      if (related instanceof Node && current?.contains(related)) return
      over = false
      if (reasonRef.current !== "hover") return
      clearTimeout(timers.current.close)
      timers.current.close = setTimeout(() => close("leave"), hoverCloseDelay)
    }

    // A press means a click trigger (or a selection) is about to win.
    const onPointerDown = () => {
      clearTimeout(timers.current.open)
      pendingTarget = null
      over = false
    }

    view.addEventListener("pointerover", onPointerOver)
    view.addEventListener("pointermove", onPointerMove)
    view.addEventListener("pointerout", onPointerOut)
    view.addEventListener("pointerdown", onPointerDown)
    return () => {
      view.removeEventListener("pointerover", onPointerOver)
      view.removeEventListener("pointermove", onPointerMove)
      view.removeEventListener("pointerout", onPointerOut)
      view.removeEventListener("pointerdown", onPointerDown)
      clearTimers()
    }
  }, [view, triggers, anchorTo, hoverDelay, hoverCloseDelay, openWith, close, isOpen, resolvePayload, clearTimers, pointAnchor, elementAnchor])

  /* ------------------------------------------------------------ selection */
  useLayoutEffect(() => {
    if (!view || !triggers.includes("selection")) return
    const doc = view.ownerDocument
    let pending = false

    const onSelectionChange = () => {
      const range = selectionRangeWithin(view)
      if (range) {
        pending = true
        return
      }
      pending = false
      if (reasonRef.current !== "selection") return
      // Pressing a form control inside the popup collapses the document
      // selection; that is the reader using the toolbar, not leaving it.
      // (Buttons never collapse it: the popup prevents their mousedown.)
      const control = doc.activeElement?.closest("input, textarea, select, [contenteditable]")
      if (control?.closest(`[data-anchored-popover="${id}"]`)) return
      close("collapse")
    }

    // Open only once the gesture ends, so a drag does not flicker the popup.
    const commit = (event: Event) => {
      if (!pending) return
      pending = false
      const range = selectionRangeWithin(view)
      if (!range) return
      const text = range.toString()
      if (text.trim().length < minSelectionLength) {
        if (reasonRef.current === "selection") close("collapse")
        return
      }
      const ancestor = range.commonAncestorContainer
      const selectionTarget =
        ancestor.nodeType === Node.ELEMENT_NODE ? (ancestor as Element) : ancestor.parentElement
      const payload = resolvePayload({ target: selectionTarget, text, event })
      // Same rule as click/hover: a resolver answering null/undefined means
      // there is nothing to show for this selection.
      if (getPayloadRef.current !== undefined && payload == null) return
      openWith(
        toAnchorRect(range),
        text,
        payload,
        selectionTarget,
        () => (range.collapsed ? null : range.getBoundingClientRect()),
        "selection"
      )
    }

    doc.addEventListener("selectionchange", onSelectionChange)
    doc.addEventListener("pointerup", commit)
    doc.addEventListener("keyup", commit)
    return () => {
      doc.removeEventListener("selectionchange", onSelectionChange)
      doc.removeEventListener("pointerup", commit)
      doc.removeEventListener("keyup", commit)
    }
  }, [view, triggers, id, minSelectionLength, openWith, close, isOpen, resolvePayload])

  /* ----------------------------------------------------- lifecycle & api */
  useEffect(() => {
    return () => {
      clearTimers()
      // Unnamed instances die with the component. An explicit id keeps its
      // last text/rect for remote readers, but never an `open` with no view
      // behind it — a remount would otherwise reopen at stale coordinates.
      if (idProp === undefined) removeAnchoredPopoverInstance(id)
      else if (store.get(anchoredPopoverOpenAtom(id))) store.set(hideAnchoredPopoverAtom(id))
    }
  }, [clearTimers, id, idProp, store])

  const show = useCallback(
    (input: TAnchorInput, payload?: TPayload) => {
      const element = input instanceof Element ? input : null
      const read: TLiveRect = element
        ? () => (element.isConnected ? element.getBoundingClientRect() : null)
        : input instanceof Range
          ? () => (input.collapsed ? null : input.getBoundingClientRect())
          : null
      openWith(toAnchorRect(input), element?.textContent ?? "", payload, element, read, "show")
    },
    [openWith]
  )

  const hide = useCallback(() => close("hide"), [close])

  const handleOpenChange = useCallback(
    (next: boolean, details?: PopoverRoot.ChangeEventDetails) => {
      if (next) {
        // `setOpen(true)` from the render props: reopen at the last anchor
        // with the last content. Nothing to reopen before a first open.
        const last = store.get(anchoredPopoverStateAtom(id))
        if (last.open || !last.rect) return
        openWith(last.rect, last.text, last.payload, null, null, "show")
        return
      }
      if (details === undefined) {
        close("hide")
        return
      }
      // Base UI dismisses on a press outside the popup (`click` for mouse,
      // `pointerdown` for touch) and when focus leaves it. When the press or
      // the new focus lands on a click/hover target, the click handler owns
      // the outcome (toggle or switch), so the dismissal is cancelled here to
      // avoid close-then-reopen.
      if (details.reason === "outside-press" || details.reason === "focus-out") {
        const event = details.event as Event | undefined
        const landing =
          details.reason === "focus-out" && event instanceof FocusEvent ? event.relatedTarget : (event?.target ?? null)
        const handlesPress = triggers.includes("click") || triggers.includes("hover")
        if (view && handlesPress && closestMatch(landing, matchRef.current, view)) {
          details.cancel()
          return
        }
      }
      close("dismiss")
    },
    [close, id, openWith, store, triggers, view]
  )

  const onPopupPointerEnter = useCallback(() => {
    clearTimeout(timers.current.close)
  }, [])

  const onPopupPointerLeave = useCallback(() => {
    if (reasonRef.current !== "hover") return
    clearTimeout(timers.current.close)
    timers.current.close = setTimeout(() => close("leave"), hoverCloseDelay)
  }, [close, hoverCloseDelay])

  const anchor = useMemo(() => {
    if (!state.rect) return null
    // The live reader belongs to the rect it was recorded with; a rect that
    // arrived through the store alone (remote `show`) has no reader.
    const read = live.rect === state.rect ? (live.read ?? undefined) : undefined
    return rectToVirtualAnchor(state.rect, view, read)
  }, [state.rect, view, live])

  const payload = state.payload as TPayload | undefined
  const openReason = state.open ? reason : null

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
      reason: openReason,
      anchor,
      text: state.text,
      payload,
      onOpenChange: handleOpenChange,
      onPopupPointerEnter,
      onPopupPointerLeave,
    },
  }
}
