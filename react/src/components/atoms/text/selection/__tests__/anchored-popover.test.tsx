import { describe, expect, mock, test } from "bun:test"
import { useRef } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AnchoredPopover } from "../anchored-popover"
import { useAnchoredPopover } from "../use-anchored-popover"
import { useAnchoredPopoverActions } from "../use-anchored-popover-state"
import type { TAnchoredPopoverReason } from "../type"

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
      <AnchoredPopover {...popover.popoverProps}>{({ text }) => <p>sel:{text}</p>}</AnchoredPopover>
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
