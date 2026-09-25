import { describe, expect, mock, test } from "bun:test"
import { fireEvent, render, screen } from "@testing-library/react"

import {
  Chart,
  useChartActions,
  useChartState,
  removeChartInstance,
} from "../chart"
import { StrictMode } from "react"
import { Provider, createStore } from "jotai"
import { chartSelectedKeyAtom } from "../chart/chart-atom"
import { buildChartConfig } from "../chart/utils"
import { createChartTooltip } from "../chart/chart-tooltip"

function Controls({ id }: { id: string }) {
  const actions = useChartActions(id)
  const { selectedKey } = useChartState(id)
  return (
    <>
      <output data-testid={`${id}-selection`}>{selectedKey ?? "none"}</output>
      <button onClick={() => actions.select("v")}>Select {id}</button>
      <button onClick={actions.clearSelection}>Clear {id}</button>
      <button onClick={actions.reset}>Reset {id}</button>
      <button onClick={() => actions.select("missing")}>Invalid {id}</button>
    </>
  )
}

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

describe("Chart selection", () => {
  test("named instances stay isolated and external actions update legend selection", () => {
    const onChange = mock(() => {})
    render(
      <Provider>
        <Chart
          chartId="one"
          type="bar"
          data={data}
          series={series}
          interactive
          onSelectionChange={onChange}
        />
        <Chart
          chartId="two"
          type="line"
          data={data}
          series={series}
          interactive
        />
        <Controls id="one" />
        <Controls id="two" />
      </Provider>
    )
    fireEvent.click(screen.getByText("Select one"))
    expect(screen.getByTestId("one-selection").textContent).toBe("v")
    expect(screen.getByTestId("two-selection").textContent).toBe("none")
    expect(
      screen
        .getAllByRole("button", { name: "Value" })[0]
        .getAttribute("aria-pressed")
    ).toBe("true")
    expect(onChange).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByText("Invalid one"))
    expect(onChange).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByText("Clear one"))
    expect(screen.getByTestId("one-selection").textContent).toBe("none")
  })
  test("controlled props remain authoritative until parent accepts selection", () => {
    const onChange = mock(() => {})
    const { rerender } = render(
      <Chart
        type="area"
        data={data}
        series={series}
        interactive
        selectedKey={null}
        onSelectionChange={onChange}
      />
    )
    fireEvent.click(screen.getByRole("button", { name: "Value" }))
    expect(onChange).toHaveBeenCalledWith("v")
    expect(
      screen.getByRole("button", { name: "Value" }).getAttribute("aria-pressed")
    ).toBe("false")
    rerender(
      <Chart
        type="area"
        data={data}
        series={series}
        interactive
        selectedKey="v"
        onSelectionChange={onChange}
      />
    )
    expect(
      screen.getByRole("button", { name: "Value" }).getAttribute("aria-pressed")
    ).toBe("true")
  })
  test("reset restores the default and removed series clear selection", () => {
    const store = createStore()
    const { rerender } = render(
      <Provider store={store}>
        <Chart
          chartId="reset"
          type="bar"
          data={data}
          series={series}
          defaultSelectedKey="v"
        />
        <Controls id="reset" />
      </Provider>
    )
    fireEvent.click(screen.getByText("Clear reset"))
    fireEvent.click(screen.getByText("Reset reset"))
    expect(store.get(chartSelectedKeyAtom("reset"))).toBe("v")
    rerender(
      <Provider store={store}>
        <Chart
          chartId="reset"
          type="bar"
          data={data}
          series={[]}
          defaultSelectedKey="v"
        />
      </Provider>
    )
    expect(store.get(chartSelectedKeyAtom("reset"))).toBeNull()
  })
  test("generated identity survives StrictMode effect replay", async () => {
    render(
      <StrictMode>
        <Chart type="line" data={data} series={series} interactive />
      </StrictMode>
    )
    await Promise.resolve()
    fireEvent.click(screen.getByRole("button", { name: "Value" }))
    expect(
      screen.getByRole("button", { name: "Value" }).getAttribute("aria-pressed")
    ).toBe("true")
  })
  test("pie selection uses category labels", () => {
    const callback = mock(() => {})
    render(
      <Chart
        type="pie"
        data={data}
        series={series}
        interactive
        onSelectionChange={callback}
      />
    )
    fireEvent.click(screen.getByRole("button", { name: "A 1" }))
    expect(callback).toHaveBeenCalledWith("A")
  })
  test("instance removal releases the atom family", () => {
    const original = chartSelectedKeyAtom("removed")
    removeChartInstance("removed")
    expect(chartSelectedKeyAtom("removed")).not.toBe(original)
  })
})
describe("Chart adapters", () => {
  test("config preserves CSS tokens and custom series colors", () => {
    expect(
      buildChartConfig("bar", data, [{ ...series[0], color: "var(--primary)" }])
        .v.colors?.light
    ).toEqual(["var(--primary)"])
    expect(Object.keys(buildChartConfig("pie", data, series))).toEqual([
      "A",
      "B",
    ])
  })
  test("tooltip escapes data and preserves React formatters", () => {
    const tooltip = createChartTooltip("bar", data, [
      {
        key: "v",
        label: "<script>",
        format: (value) => <strong>{value}%</strong>,
      },
    ])
    const html = tooltip({ seriesIndex: 0, dataIndex: 1 })
    expect(html).toContain("&lt;script&gt;")
    expect(html).toContain("<strong>2%</strong>")
  })
})

test("tooltip defaults to frosted glass with one surface shadow", () => {
  const params = { seriesIndex: 0, dataIndex: 1 }
  const html = createChartTooltip("bar", data, series)(params)
  expect(html).toContain("bg-background/50")
  expect(html).toContain("backdrop-blur-md")
  expect(html).toContain("box-shadow:0 4px 12px rgb(0 0 0 / 0.12)")
  const solid = createChartTooltip("bar", data, series, { variant: "default" })(
    params
  )
  expect(solid).not.toContain("backdrop-blur-md")
})

describe("Chart consumer layout", () => {
  test("accepts CSS dimensions and replaces the framed root", () => {
    const { container } = render(
      <Chart
        type="bar"
        data={[]}
        series={series}
        width="100%"
        height={360}
        render={<section aria-label="Research chart" />}
      />
    )
    const root = screen.getByRole("region", { name: "Research chart" })
    expect(root.getAttribute("data-slot")).toBe("chart")
    expect(root.style.width).toBe("100%")
    expect(root.style.height).toBe("360px")
    expect(
      (container.querySelector('[role="group"]') as HTMLElement).style.height
    ).toBe("100%")
  })
  test("explicit plot height and consumer styles take precedence", () => {
    const { container } = render(
      <Chart
        type="bar"
        data={[]}
        series={series}
        width={320}
        height={360}
        plotHeight="12rem"
        style={{ width: "90%" }}
      />
    )
    expect(
      (container.querySelector('[data-slot="chart"]') as HTMLElement).style
        .width
    ).toBe("90%")
    expect(
      (container.querySelector('[role="group"]') as HTMLElement).style.height
    ).toBe("12rem")
  })
  test("custom components receive props and children in headerless mode", () => {
    function Surface(props: React.ComponentProps<"section">) {
      return <section {...props} data-surface="custom" />
    }
    render(
      <Chart
        type="pie"
        data={[]}
        series={series}
        headerless
        render={<Surface aria-label="Bare chart" />}
        width={480}
        height={240}
      />
    )
    const root = screen.getByRole("region", { name: "Bare chart" })
    expect(root.getAttribute("data-surface")).toBe("custom")
    expect(root.style.width).toBe("480px")
    expect(screen.getByRole("status").textContent).toBe("No data")
  })
})
