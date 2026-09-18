import { describe, expect, mock, test } from "bun:test"
import { fireEvent, render, screen } from "@testing-library/react"

import { Chart } from "../chart"

const data = [
  { label: "A", v: 1 },
  { label: "B", v: 2 },
]
const series = [{ key: "v", label: "Value" }]

describe("Chart", () => {
  test("renders every type with its pill and legend", () => {
    render(
      <>
        <Chart
          type="pie"
          title="Pie"
          data={data}
          series={series}
          center={{ value: "3" }}
        />
        <Chart type="area" title="Area" data={data} series={series} />
        <Chart type="line" title="Line" data={data} series={series} />
        <Chart type="bar" title="Bar" data={data} series={series} />
      </>
    )
    for (const t of ["Pie", "Area", "Line", "Bar"])
      expect(screen.getAllByText(t).length).toBeGreaterThan(0)
    expect(screen.getAllByText("Value").length).toBe(3)
    expect(screen.getByText("3")).toBeDefined()
  })

  test("empty data keeps the chrome and drops the legend", () => {
    const { container } = render(
      <Chart type="bar" title="Empty" data={[]} series={series} />
    )
    expect(screen.getByText("Empty")).toBeDefined()
    expect(container.querySelectorAll('[data-slot="legend-item"]').length).toBe(
      0
    )
  })

  test("uses the supplied reference instead of the type badge and routes selection", () => {
    const onClick = mock(() => {})
    const { container } = render(
      <Chart
        type="area"
        title="Cross-reference coverage"
        reference={{ children: "John 3:14–18", onClick }}
        data={data}
        series={series}
      />
    )
    expect(screen.queryByText("Area")).toBeNull()
    expect(
      container.querySelectorAll('[data-slot="reference-chip"]').length
    ).toBe(1)
    fireEvent.click(screen.getByRole("button", { name: "John 3:14–18" }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
