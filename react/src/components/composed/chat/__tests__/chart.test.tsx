import { describe, expect, test } from "bun:test"
import { render, screen } from "@testing-library/react"

import { Chart } from "../chart"

const data = [{ label: "A", v: 1 }, { label: "B", v: 2 }]
const series = [{ key: "v", label: "Value" }]

describe("Chart", () => {
  test("renders every type with its pill and legend", () => {
    render(
      <>
        <Chart type="pie" title="Pie" data={data} series={series} center={{ value: "3" }} />
        <Chart type="area" title="Area" data={data} series={series} />
        <Chart type="line" title="Line" data={data} series={series} />
        <Chart type="bar" title="Bar" data={data} series={series} />
      </>
    )
    for (const t of ["Pie", "Area", "Line", "Bar"]) expect(screen.getAllByText(t).length).toBeGreaterThan(0)
    expect(screen.getAllByText("Value").length).toBe(3)
    expect(screen.getByText("3")).toBeDefined()
  })

  test("empty data keeps the chrome and drops the legend", () => {
    const { container } = render(<Chart type="bar" title="Empty" data={[]} series={series} />)
    expect(screen.getByText("Empty")).toBeDefined()
    expect(container.querySelectorAll('[data-slot="legend-item"]').length).toBe(0)
  })
})
