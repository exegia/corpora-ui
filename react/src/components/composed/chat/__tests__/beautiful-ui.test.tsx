import { describe, expect, mock, test } from "bun:test"
import { fireEvent, render, screen } from "@testing-library/react"
import { Provider } from "jotai"

import { FilterTable, RecordsTable, StreamingText } from "../index"

describe("StreamingText", () => {
  test("shows all text without streaming and toggles the sources panel", () => {
    render(
      <Provider>
        <StreamingText paragraphs={["Hello world", [{ cite: "a.io" }, { text: "done" }]]} sources={[{ name: "A", domain: "a.io" }]} />
      </Provider>
    )
    expect(screen.getByText(/Hello/)).toBeDefined()
    expect(screen.queryByRole("list")).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: /1 sources/ }))
    expect(screen.getByRole("list")).toBeDefined()
    fireEvent.click(screen.getByRole("button", { name: /1 sources/ }))
    expect(screen.queryByRole("list")).toBeNull()
  })
})

describe("FilterTable", () => {
  const rows = [
    { id: "1", task: "A", status: "todo" },
    { id: "2", task: "B", status: "done" },
  ]
  test("filters rows by status pill", () => {
    render(
      <Provider>
        <FilterTable
          statuses={[{ id: "todo", label: "To do", tone: "warning" }, { id: "done", label: "Completed", tone: "success" }]}
          columns={[{ key: "task", header: "Task" }, { key: "status", header: "Status" }]}
          rows={rows}
        />
      </Provider>
    )
    expect(screen.getAllByRole("row").length).toBe(3)
    fireEvent.click(screen.getByRole("tab", { name: /Completed/ }))
    expect(screen.getAllByRole("row").length).toBe(2)
    expect(screen.getByText("B")).toBeDefined()
    fireEvent.click(screen.getByRole("tab", { name: /All/ }))
    expect(screen.getAllByRole("row").length).toBe(3)
  })
})

describe("RecordsTable", () => {
  test("row and select-all checkboxes drive the selection", () => {
    const onSelectionChange = mock((_selected: ReadonlySet<string>) => {})
    render(
      <Provider>
        <RecordsTable rows={[{ id: "a", name: "A" }, { id: "b", name: "B" }]} onSelectionChange={onSelectionChange} />
      </Provider>
    )
    fireEvent.click(screen.getByRole("checkbox", { name: "Select row 1" }))
    expect([...onSelectionChange.mock.calls.at(-1)![0]]).toEqual(["a"])
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all" }))
    expect([...onSelectionChange.mock.calls.at(-1)![0]].sort()).toEqual(["a", "b"])
  })
})
