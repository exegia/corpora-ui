import { expect, mock, test } from "bun:test"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MenuCommand } from "@/components/ui/menu-command"

test("filters commands and selects with the keyboard", async () => {
  const user = userEvent.setup()
  const onSelect = mock(() => {})
  const action = mock(() => {})
  render(
    <MenuCommand
      onSelect={onSelect}
      items={[
        { id: "search", label: "Search corpus" },
        { id: "export", label: "Export notes", onSelect: action },
      ]}
    >
      <button>Commands</button>
    </MenuCommand>
  )
  await user.click(screen.getByRole("button", { name: "Commands" }))
  const input = await screen.findByRole("combobox", { name: "Search commands" })
  await user.type(input, "Export")
  await waitFor(() =>
    expect(screen.queryByRole("option", { name: "Search corpus" })).toBeNull()
  )
  await user.keyboard("{ArrowDown}{Enter}")
  expect(action).toHaveBeenCalledTimes(1)
  expect(onSelect).toHaveBeenCalledTimes(1)
  await waitFor(() =>
    expect(
      screen.queryByRole("combobox", { name: "Search commands" })
    ).toBeNull()
  )
})
