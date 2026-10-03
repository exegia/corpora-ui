import { describe, expect, mock, test } from "bun:test"
import { useRef } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AnchoredPopover } from "../anchored-popover"
import { useAnchoredPopover } from "../use-anchored-popover"
import { useAnchoredPopoverActions } from "../use-anchored-popover-state"
import type { TAnchoredPopoverReason } from "../type"

type TOpenChange = (open: boolean, reason: TAnchoredPopoverReason) => void

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
    expect(screen.queryByText("term:alpha")).toBeNull()

    await user.click(screen.getByText("alpha"))
    expect(await screen.findByText("term:alpha")).toBeTruthy()
    expect(screen.getByText("text:alpha")).toBeTruthy()
    expect(onOpenChange).toHaveBeenLastCalledWith(true, "click")

    await user.click(screen.getByText("plain"))
    // An unmatched click is not a target, so it is an ordinary outside press:
    // Base UI dismisses the popover and nothing reopens it.
    await waitFor(() => expect(screen.queryByText("term:alpha")).toBeNull())
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
    await waitFor(() => expect(screen.queryByText("term:beta")).toBeNull())
    expect(onOpenChange).toHaveBeenLastCalledWith(false, "toggle")
  })

  test("Enter on a focused target opens; Escape closes", async () => {
    const user = userEvent.setup()
    render(<ClickHarness />)
    screen.getByText("beta").focus()
    await user.keyboard("{Enter}")
    expect(await screen.findByText("term:beta")).toBeTruthy()

    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByText("term:beta")).toBeNull())
  })

  test("the render-prop close dismisses", async () => {
    const user = userEvent.setup()
    render(<ClickHarness />)
    await user.click(screen.getByText("alpha"))
    await user.click(await screen.findByText("Dismiss"))
    await waitFor(() => expect(screen.queryByText("term:alpha")).toBeNull())
  })

  test("a link only loses its default when it has popover content", async () => {
    const user = userEvent.setup()
    const onLinkClick = mock((_prevented: boolean) => {})
    render(<ClickHarness onLinkClick={onLinkClick} />)

    await user.click(screen.getByText("bare link"))
    expect(onLinkClick).toHaveBeenLastCalledWith(false)
    expect(screen.queryByText(/^term:/)).toBeNull()

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
    expect(screen.queryByText("term:alpha")).toBeNull()
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
    await waitFor(() => expect(screen.queryByText("term:point")).toBeNull())
  })
})
