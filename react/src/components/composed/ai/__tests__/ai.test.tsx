import { describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import { Message } from "../message"
import type { AIContentProps } from "../types"

describe("Message", () => {
  test("renders the agent identity row and the body as a polite live region", () => {
    const { container } = render(
      <Message type="markdown">Hello reader</Message>
    )

    expect(screen.getByText("Exegia")).toBeDefined()
    expect(screen.getByText("Agent")).toBeDefined()
    expect(screen.getByText("AI Scholar")).toBeDefined()

    const root = container.querySelector('[data-slot="ai-message"]')
    expect(root).not.toBeNull()
    expect(root!.getAttribute("data-variant")).toBe("ai")

    const body = container.querySelector('[data-slot="ai-message-body"]')
    expect(body).not.toBeNull()
    expect(body!.getAttribute("aria-live")).toBe("polite")
    expect(body!.textContent).toContain("Hello reader")
  })

  test("marks the root while streaming and drops the flag at rest", () => {
    const { container, rerender } = render(
      <Message isStreaming type="markdown" />
    )
    const root = container.querySelector('[data-slot="ai-message"]')!
    expect(root.hasAttribute("data-streaming")).toBe(true)

    rerender(<Message type="markdown" />)
    expect(root.hasAttribute("data-streaming")).toBe(false)
  })

  test("hands AttachedContent the message type as `kind` plus contentProps", () => {
    const seen = mock<(props: AIContentProps<"chart">) => void>(() => {})
    const Attached = (props: AIContentProps<"chart">) => {
      seen(props)
      return <div data-testid="attached">chart goes here</div>
    }

    render(
      <Message
        AttachedContent={Attached}
        contentProps={{ type: "bar", data: [], series: [] }}
        type="chart"
      />
    )

    expect(screen.getByTestId("attached")).toBeDefined()
    expect(seen).toHaveBeenCalledTimes(1)
    expect(seen.mock.calls[0]?.[0]).toMatchObject({
      kind: "chart",
      type: "bar",
      data: [],
      series: [],
    })
  })

  test("renders no attachment slot when AttachedContent is omitted", () => {
    const { container } = render(<Message type="markdown">Prose only</Message>)
    const body = container.querySelector('[data-slot="ai-message-body"]')!
    expect(body.textContent).toBe("Prose only")
  })
})
