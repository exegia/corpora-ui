import type { IAnchorRect, IVirtualAnchor, TAnchorInput, TAnchoredPopoverMatch } from "./type"

const ZERO: IAnchorRect = { x: 0, y: 0, width: 0, height: 0 }

function copyRect(rect: { x: number; y: number; width: number; height: number }): IAnchorRect {
  return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
}

/**
 * Snapshot any anchor input as a plain rect. A point becomes a zero-size rect.
 * Browser-only (it reads DOM globals) — callers run from event handlers and
 * effects, never during render.
 */
export function toAnchorRect(input: TAnchorInput): IAnchorRect {
  if (input instanceof Element) {
    return copyRect(input.getBoundingClientRect())
  }
  if (input instanceof Range) {
    // happy-dom implements this; guard anyway so a thin DOM never throws.
    return typeof input.getBoundingClientRect === "function"
      ? copyRect(input.getBoundingClientRect())
      : ZERO
  }
  if ("width" in input && "height" in input) return copyRect(input)
  return { x: input.x, y: input.y, width: 0, height: 0 }
}

/**
 * Wrap a rect as the virtual element Base UI positions against. `live`
 * (an element's or range's own `getBoundingClientRect`) wins when given, so
 * the popup follows the text through scroll and reflow; the stored rect is
 * the fallback for point anchors and remote readers.
 */
export function rectToVirtualAnchor(
  rect: IAnchorRect,
  contextElement?: Element | null,
  live?: () => DOMRect | null
): IVirtualAnchor {
  return {
    contextElement: contextElement ?? undefined,
    getBoundingClientRect: () => {
      const current = live?.()
      if (current) return current
      const { x, y, width, height } = rect
      return {
        x,
        y,
        width,
        height,
        top: y,
        left: x,
        right: x + width,
        bottom: y + height,
        toJSON: () => ({ x, y, width, height }),
      } as DOMRect
    },
  }
}

function toElement(node: EventTarget | Node | null | undefined): Element | null {
  if (!node || !(node instanceof Node)) return null
  return node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement
}

/** The current non-collapsed selection range, if its common ancestor sits inside `view`. */
export function selectionRangeWithin(view: Element): Range | null {
  const selection = view.ownerDocument.getSelection()
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null
  const range = selection.getRangeAt(0)
  const ancestor = toElement(range.commonAncestorContainer)
  if (!ancestor || !view.contains(ancestor)) return null
  return range
}

/**
 * Walk up from an event target to the first element matching `match`, stopping
 * at the view. With no matcher any element inside the view counts — the view
 * itself included, since a click on bare text targets the view.
 */
export function closestMatch(
  start: EventTarget | Node | null | undefined,
  match: TAnchoredPopoverMatch | undefined,
  view: Element
): Element | null {
  let element = toElement(start)
  if (!element) return null
  if (match === undefined) {
    return element === view || view.contains(element) ? element : null
  }
  while (element && element !== view) {
    if (typeof match === "string" ? element.matches(match) : match(element)) return element
    element = element.parentElement
  }
  return null
}

/** Non-primary button or any modifier — the browser's own behavior should win. */
export function isModifiedClick(event: MouseEvent): boolean {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
}
