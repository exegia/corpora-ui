import { describe, expect, mock, test } from "bun:test"
import { useEffect, useRef, useState } from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AnchoredPopover } from "../anchored-popover"
import { useAnchoredPopover } from "../use-anchored-popover"
import { useAnchoredPopoverActions } from "../use-anchored-popover-state"
import type { IUseAnchoredPopoverOptions, TAnchoredPopoverReason } from "../index"

type TOpenChange = (open: boolean, reason: TAnchoredPopoverReason) => void

/**
 * Assert that no element with `text` is rendered. Throws a plain Error rather
 * than using `expect(element).toBeNull()`: on failure bun serializes the DOM
 * element (React fiber included), which blocks the event loop for seconds
 * and starves the timers a `waitFor` is waiting on.
 */
function expectAbsent(text: string | RegExp): void {
  if (screen.queryByText(text)) throw new Error(`expected no element with text ${String(text)}`)
}

function ClickHarness({
  onOpenChange,
  onLinkClick,
}: {
  onOpenChange?: TOpenChange
  onLinkClick?: (defaultPrevented: boolean) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const popover = useAnchoredPopover<string | null>({
    ref,
    id: "click-harness",
    trigger: "click",
    match: "[data-term]",
    getPayload: ({ target }) => (target as HTMLElement).dataset.term || null,
    onOpenChange,
  })
  return (
    <div ref={ref}>
      <span data-term="alpha" role="button" tabIndex={0}>
        alpha
      </span>{" "}
      <span data-term="beta" role="button" tabIndex={0}>
        beta
      </span>{" "}
      <span>plain</span>{" "}
      <a data-term="" href="#bare" onClick={(e) => onLinkClick?.(e.defaultPrevented)}>
        bare link
      </a>{" "}
      <a data-term="gamma" href="#gamma" onClick={(e) => onLinkClick?.(e.defaultPrevented)}>
        gamma link
      </a>
      <button type="button" onClick={() => popover.show({ x: 10, y: 20 }, "point")}>
        show at point
      </button>
      <AnchoredPopover {...popover.popoverProps}>
        {({ text, payload, close }) => (
          <div>
            <p>term:{payload}</p>
            <p>text:{text}</p>
            <button type="button" onClick={close}>
              Dismiss
            </button>
          </div>
        )}
      </AnchoredPopover>
    </div>
  )
}

function RemoteCloser() {
  const { hide } = useAnchoredPopoverActions("click-harness")
  return (
    <button type="button" onClick={hide}>
      Remote close
    </button>
  )
}

describe("useAnchoredPopover · click", () => {
  test("a matched click opens with the payload and text; unmatched clicks are ignored", async () => {
    const user = userEvent.setup()
    const onOpenChange = mock<TOpenChange>(() => {})
    render(<ClickHarness onOpenChange={onOpenChange} />)
    expectAbsent("term:alpha")

    await user.click(screen.getByText("alpha"))
    expect(await screen.findByText("term:alpha")).toBeTruthy()
    expect(screen.getByText("text:alpha")).toBeTruthy()
    expect(onOpenChange).toHaveBeenLastCalledWith(true, "click")

    await user.click(screen.getByText("plain"))
    // An unmatched click is not a target, so it is an ordinary outside press:
    // Base UI dismisses the popover and nothing reopens it.
    await waitFor(() => expectAbsent("term:alpha"))
    expect(onOpenChange).toHaveBeenLastCalledWith(false, "dismiss")
  })

  test("clicking another target switches; clicking the open target closes", async () => {
    const user = userEvent.setup()
    const onOpenChange = mock<TOpenChange>(() => {})
    render(<ClickHarness onOpenChange={onOpenChange} />)

    await user.click(screen.getByText("alpha"))
    await screen.findByText("term:alpha")
    await user.click(screen.getByText("beta"))
    expect(await screen.findByText("term:beta")).toBeTruthy()

    await user.click(screen.getByText("beta"))
    await waitFor(() => expectAbsent("term:beta"))
    expect(onOpenChange).toHaveBeenLastCalledWith(false, "toggle")
  })

  test("Enter on a focused target opens; Escape closes", async () => {
    const user = userEvent.setup()
    render(<ClickHarness />)
    screen.getByText("beta").focus()
    await user.keyboard("{Enter}")
    expect(await screen.findByText("term:beta")).toBeTruthy()

    await user.keyboard("{Escape}")
    await waitFor(() => expectAbsent("term:beta"))
  })

  test("the render-prop close dismisses", async () => {
    const user = userEvent.setup()
    render(<ClickHarness />)
    await user.click(screen.getByText("alpha"))
    await user.click(await screen.findByText("Dismiss"))
    await waitFor(() => expectAbsent("term:alpha"))
  })

  test("a link only loses its default when it has popover content", async () => {
    const user = userEvent.setup()
    const onLinkClick = mock((_prevented: boolean) => {})
    render(<ClickHarness onLinkClick={onLinkClick} />)

    await user.click(screen.getByText("bare link"))
    expect(onLinkClick).toHaveBeenLastCalledWith(false)
    expectAbsent(/^term:/)

    await user.click(screen.getByText("gamma link"))
    expect(onLinkClick).toHaveBeenLastCalledWith(true)
    expect(await screen.findByText("term:gamma")).toBeTruthy()
  })

  test("a modified click never opens", async () => {
    const user = userEvent.setup()
    render(<ClickHarness />)
    await user.keyboard("[MetaLeft>]")
    await user.click(screen.getByText("alpha"))
    await user.keyboard("[/MetaLeft]")
    expectAbsent("term:alpha")
  })
})

describe("useAnchoredPopover · imperative and remote", () => {
  test("show() opens at a point and a remote hide() closes by id", async () => {
    const user = userEvent.setup()
    render(
      <>
        <ClickHarness />
        <RemoteCloser />
      </>
    )
    await user.click(screen.getByText("show at point"))
    expect(await screen.findByText("term:point")).toBeTruthy()

    await user.click(screen.getByText("Remote close"))
    await waitFor(() => expectAbsent("term:point"))
  })
})

function HoverHarness({ onOpenChange }: { onOpenChange?: TOpenChange }) {
  const ref = useRef<HTMLDivElement>(null)
  const popover = useAnchoredPopover<string>({
    ref,
    trigger: "hover",
    match: "[data-term]",
    getPayload: ({ target }) => (target as HTMLElement).dataset.term ?? "",
    hoverDelay: 10,
    hoverCloseDelay: 30,
    onOpenChange,
  })
  return (
    <div ref={ref}>
      <span data-term="alpha">alpha</span> <span>plain</span>
      <AnchoredPopover {...popover.popoverProps}>{({ payload }) => <p>hover:{payload}</p>}</AnchoredPopover>
    </div>
  )
}

describe("useAnchoredPopover · hover", () => {
  test("opens after the delay and closes after leaving", async () => {
    const user = userEvent.setup()
    const onOpenChange = mock<TOpenChange>(() => {})
    render(<HoverHarness onOpenChange={onOpenChange} />)

    await user.hover(screen.getByText("alpha"))
    expectAbsent("hover:alpha")
    expect(await screen.findByText("hover:alpha")).toBeTruthy()
    expect(onOpenChange).toHaveBeenLastCalledWith(true, "hover")

    await user.unhover(screen.getByText("alpha"))
    await waitFor(() => expectAbsent("hover:alpha"))
    expect(onOpenChange).toHaveBeenLastCalledWith(false, "leave")
  })

  test("moving into the popup keeps it open", async () => {
    const user = userEvent.setup()
    render(<HoverHarness />)
    await user.hover(screen.getByText("alpha"))
    const popup = await screen.findByText("hover:alpha")

    await user.unhover(screen.getByText("alpha"))
    await user.hover(popup)
    await new Promise((resolve) => setTimeout(resolve, 60))
    expect(screen.getByText("hover:alpha")).toBeTruthy()
  })

  test("leaving before the delay never opens; unmounting clears the timer", async () => {
    const user = userEvent.setup()
    const { unmount } = render(<HoverHarness />)
    await user.hover(screen.getByText("alpha"))
    await user.unhover(screen.getByText("alpha"))
    await new Promise((resolve) => setTimeout(resolve, 30))
    expectAbsent("hover:alpha")

    await user.hover(screen.getByText("alpha"))
    unmount()
    await new Promise((resolve) => setTimeout(resolve, 30))
    // No throw, no act() warning, nothing rendered.
    expect(document.querySelector("[data-anchored-popover]")).toBeNull()
  })
})

function selectText(element: Element, start: number, end: number) {
  const node = element.firstChild as Text
  const range = document.createRange()
  range.setStart(node, start)
  range.setEnd(node, end)
  const selection = document.getSelection()!
  selection.removeAllRanges()
  selection.addRange(range)
  document.dispatchEvent(new Event("selectionchange"))
}

function collapseSelection() {
  document.getSelection()!.removeAllRanges()
  document.dispatchEvent(new Event("selectionchange"))
}

function SelectionHarness({
  onOpenChange,
  minSelectionLength,
}: {
  onOpenChange?: TOpenChange
  minSelectionLength?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const popover = useAnchoredPopover({ ref, id: "selection-harness", onOpenChange, minSelectionLength })
  return (
    <>
      <div ref={ref}>
        <p>Selectable corpus text</p>
      </div>
      <p>Outside text</p>
      <AnchoredPopover {...popover.popoverProps}>
        {({ text }) => (
          <div>
            <p>sel:{text}</p>
            <button type="button">Act</button>
            <input aria-label="note" />
          </div>
        )}
      </AnchoredPopover>
    </>
  )
}

describe("useAnchoredPopover · selection", () => {
  test("opens on pointerup after a selection inside the view, with the selected text", async () => {
    const onOpenChange = mock<TOpenChange>(() => {})
    render(<SelectionHarness onOpenChange={onOpenChange} />)
    selectText(screen.getByText("Selectable corpus text"), 0, 10)
    expectAbsent("sel:Selectable")

    document.dispatchEvent(new Event("pointerup"))
    expect(await screen.findByText("sel:Selectable")).toBeTruthy()
    expect(onOpenChange).toHaveBeenLastCalledWith(true, "selection")
  })

  test("a keyboard selection commits on keyup", async () => {
    render(<SelectionHarness />)
    selectText(screen.getByText("Selectable corpus text"), 11, 17)
    document.dispatchEvent(new Event("keyup"))
    expect(await screen.findByText("sel:corpus")).toBeTruthy()
  })

  test("collapsing the selection closes with reason collapse", async () => {
    const onOpenChange = mock<TOpenChange>(() => {})
    render(<SelectionHarness onOpenChange={onOpenChange} />)
    selectText(screen.getByText("Selectable corpus text"), 0, 10)
    document.dispatchEvent(new Event("pointerup"))
    await screen.findByText("sel:Selectable")

    collapseSelection()
    await waitFor(() => expectAbsent("sel:Selectable"))
    expect(onOpenChange).toHaveBeenLastCalledWith(false, "collapse")
  })

  test("a selection outside the view is ignored and closes an open popover", async () => {
    render(<SelectionHarness />)
    selectText(screen.getByText("Selectable corpus text"), 0, 10)
    document.dispatchEvent(new Event("pointerup"))
    await screen.findByText("sel:Selectable")

    selectText(screen.getByText("Outside text"), 0, 7)
    document.dispatchEvent(new Event("pointerup"))
    await waitFor(() => expectAbsent(/^sel:/))
  })

  test("selections shorter than minSelectionLength do not open", async () => {
    render(<SelectionHarness minSelectionLength={4} />)
    selectText(screen.getByText("Selectable corpus text"), 0, 3)
    document.dispatchEvent(new Event("pointerup"))
    await new Promise((resolve) => setTimeout(resolve, 20))
    expectAbsent(/^sel:/)
  })
})

/* ------------------------------------------------------------------ */
/* Review fix pass                                                     */
/* ------------------------------------------------------------------ */

// The option type is imported from the barrel on purpose: consumers reach
// the hook's types through the package root.
const lateOptions: Omit<IUseAnchoredPopoverOptions<string>, "ref"> = {
  trigger: "click",
  match: "[data-term]",
  getPayload: ({ target }) => (target as HTMLElement).dataset.term ?? "",
}

function LateViewHarness() {
  const [shown, setShown] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const popover = useAnchoredPopover<string>({ ref, ...lateOptions })
  return (
    <>
      <button type="button" onClick={() => setShown(true)}>
        reveal
      </button>
      {shown ? (
        <div ref={ref}>
          <span data-term="late">late</span>
        </div>
      ) : null}
      <AnchoredPopover {...popover.popoverProps}>{({ payload }) => <p>late:{payload}</p>}</AnchoredPopover>
    </>
  )
}

function BothHarness() {
  const ref = useRef<HTMLDivElement>(null)
  const popover = useAnchoredPopover({ ref, id: "both-harness", trigger: ["selection", "click"] })
  return (
    <>
      <div ref={ref}>
        <p>Selectable corpus text</p>
      </div>
      <AnchoredPopover {...popover.popoverProps}>{({ text }) => <p>both:{text}</p>}</AnchoredPopover>
    </>
  )
}

function TickingHoverHarness() {
  const [, tick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => tick((n) => n + 1), 5)
    return () => clearInterval(interval)
  }, [])
  const ref = useRef<HTMLDivElement>(null)
  const popover = useAnchoredPopover<string>({
    ref,
    trigger: "hover",
    match: (el) => el.hasAttribute("data-term"),
    getPayload: ({ target }) => (target as HTMLElement).dataset.term ?? "",
    hoverDelay: 30,
    hoverCloseDelay: 30,
  })
  return (
    <div ref={ref}>
      <span data-term="tick">tick</span>
      <AnchoredPopover {...popover.popoverProps}>{({ payload }) => <p>tick:{payload}</p>}</AnchoredPopover>
    </div>
  )
}

function AnchorProbe() {
  const ref = useRef<HTMLDivElement>(null)
  const popover = useAnchoredPopover<string>({
    ref,
    id: "anchor-probe",
    trigger: "click",
    match: "[data-term]",
    getPayload: ({ target }) => (target as HTMLElement).dataset.term ?? "",
  })
  return (
    <>
      <div ref={ref}>
        <span data-term="a">a</span>
      </div>
      <button type="button" onClick={popover.hide}>
        hide
      </button>
      <output data-testid="anchor-x">{popover.anchor ? String(popover.anchor.getBoundingClientRect().x) : "none"}</output>
      <AnchoredPopover {...popover.popoverProps}>{({ text }) => <p>probe:{text}</p>}</AnchoredPopover>
    </>
  )
}

function RemoteShower() {
  const { show } = useAnchoredPopoverActions("anchor-probe")
  return (
    <button type="button" onClick={() => show({ rect: { x: 400, y: 300, width: 10, height: 10 }, text: "remote" })}>
      remote show
    </button>
  )
}

describe("useAnchoredPopover · review fixes", () => {
  test("a view that mounts after the hook still gets its listeners", async () => {
    const user = userEvent.setup()
    render(<LateViewHarness />)
    await user.click(screen.getByText("reveal"))
    await user.click(screen.getByText("late"))
    expect(await screen.findByText("late:late")).toBeTruthy()
  })

  test("the click that ends a drag-selection does not close or replace the selection popover", async () => {
    render(<BothHarness />)
    const p = screen.getByText("Selectable corpus text")
    selectText(p, 0, 10)
    document.dispatchEvent(new Event("pointerup"))
    await screen.findByText("both:Selectable")

    // Browsers fire `click` on the element where a drag ends.
    fireEvent.click(p)
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(screen.getByText("both:Selectable")).toBeTruthy()
  })

  test("focusing an input inside a selection popover does not collapse-close it", async () => {
    render(<SelectionHarness />)
    selectText(screen.getByText("Selectable corpus text"), 0, 10)
    document.dispatchEvent(new Event("pointerup"))
    await screen.findByText("sel:Selectable")

    // Pressing a form control collapses the document selection in browsers.
    screen.getByLabelText("note").focus()
    collapseSelection()
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(screen.getByText("sel:Selectable")).toBeTruthy()
  })

  test("a hover-opened popover leaves focus where it was", async () => {
    const user = userEvent.setup()
    render(
      <>
        <input aria-label="search" />
        <HoverHarness />
      </>
    )
    const search = screen.getByLabelText("search")
    search.focus()
    await user.hover(screen.getByText("alpha"))
    await screen.findByText("hover:alpha")
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(document.activeElement).toBe(search)
  })

  test("an inline match predicate on a re-rendering parent still opens on hover", async () => {
    const user = userEvent.setup()
    render(<TickingHoverHarness />)
    await user.hover(screen.getByText("tick"))
    expect(await screen.findByText("tick:tick")).toBeTruthy()
  })

  test("a remote show() anchors to its own rect, not the previous target", async () => {
    const user = userEvent.setup()
    render(
      <>
        <AnchorProbe />
        <RemoteShower />
      </>
    )
    await user.click(screen.getByText("a"))
    await screen.findByText("probe:a")
    await user.click(screen.getByText("hide"))
    await waitFor(() => expectAbsent("probe:a"))

    await user.click(screen.getByText("remote show"))
    await screen.findByText("probe:remote")
    await waitFor(() => expect(screen.getByTestId("anchor-x").textContent).toBe("400"))
  })

  test("text inside a click-opened popover can be selected (mousedown keeps its default)", async () => {
    const user = userEvent.setup()
    render(<ClickHarness />)
    await user.click(screen.getByText("alpha"))
    const text = await screen.findByText("text:alpha")
    expect(fireEvent.mouseDown(text)).toBe(true)
  })

  test("buttons inside a selection-opened popover keep the selection (mousedown is prevented)", async () => {
    render(<SelectionHarness />)
    selectText(screen.getByText("Selectable corpus text"), 0, 10)
    document.dispatchEvent(new Event("pointerup"))
    await screen.findByText("sel:Selectable")
    expect(fireEvent.mouseDown(screen.getByText("Act"))).toBe(false)
    expect(fireEvent.mouseDown(screen.getByText("sel:Selectable"))).toBe(true)
  })
})
