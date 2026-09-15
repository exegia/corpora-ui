import { expect, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import ButtonDemo from "../button-demo"

test("button controls reveal glass options and render icon sizes without text", async () => {
  const user = userEvent.setup()
  render(<ButtonDemo />)

  expect(screen.queryByText("glassVariant")).toBeNull()
  expect(screen.getAllByRole("radio")).toHaveLength(6)

  await user.click(screen.getByRole("combobox", { name: "variant" }))
  await user.click(screen.getByRole("option", { name: "glass" }))
  expect(screen.getByText("glassVariant")).toBeTruthy()

  await user.click(screen.getByRole("combobox", { name: "size" }))
  await user.click(screen.getByRole("option", { name: "icon" }))
  expect(screen.getByRole("button", { name: "Open manuscript" })).toBeTruthy()
  expect(screen.queryByRole("button", { name: "Button" })).toBeNull()
})
