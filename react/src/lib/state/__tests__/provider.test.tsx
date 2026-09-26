import { expect, test } from "bun:test"
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { atom, createStore, useAtom } from "jotai"
import { ExegiaProvider, useExegiaStore } from "../exegia-provider"
import { useShellPanels } from "@/components/blocks/shell/use-shell-panels"
import { useScaffoldActions, useScaffoldState } from "@/components/blocks/scaffold/use-scaffold-state"
import { Modal, ModalTrigger, ModalPopup, ModalTitle, ModalClose } from "@/components/ui/modal"
import { Popover, PopoverTrigger, PopoverPopup } from "@/components/ui/popover"
import { Tooltip, TooltipTrigger, TooltipPopup } from "@/components/ui/tooltip"
import { ToastPrimitive } from "@/components/ui/toast"
import { PopoverGlass } from "@/components/ui/popover-glass"

const countAtom = atom(0)
const modalOpenAtom = atom(false)

test("glass popovers inherit, defer, and override the provider portal destination", async () => {
  const host = document.createElement("div")
  const override = document.createElement("div")
  document.body.append(host, override)
  const content = (container?: HTMLElement) => (
    <Popover open>
      <PopoverTrigger>Glass details</PopoverTrigger>
      <PopoverGlass portalProps={{ container }}>Glass portal content</PopoverGlass>
    </Popover>
  )
  const view = render(<ExegiaProvider portalContainer={null}>{content()}</ExegiaProvider>)
  try {
    expect(screen.queryByText("Glass portal content")).toBeNull()
    view.rerender(<ExegiaProvider portalContainer={host}>{content()}</ExegiaProvider>)
    expect(host.contains(await screen.findByText("Glass portal content"))).toBe(true)
    view.rerender(<ExegiaProvider portalContainer={host}>{content(override)}</ExegiaProvider>)
    await waitFor(() => expect(override.contains(screen.getByText("Glass portal content"))).toBe(true))
    expect(host.textContent).not.toContain("Glass portal content")
  } finally {
    view.unmount()
    host.remove()
    override.remove()
  }
})

function Counter() {
  const [count, setCount] = useAtom(countAtom)
  return <button onClick={() => setCount(count + 1)}>Count {count}</button>
}

function PanelState() {
  const store = useExegiaStore()
  const shell = useShellPanels({ shellId: "provider-contract" })
  const scaffold = useScaffoldState("provider-contract")
  const actions = useScaffoldActions("provider-contract")
  return (
    <>
      <Counter />
      <button onClick={() => {
        shell.openPanel("right")
        actions.setInspectorOpen(true)
        store.set(countAtom, 7)
      }}>Open panels</button>
      <p>Shell {String(shell.open.right)}</p>
      <p>Inspector {String(scaffold.inspectorOpen)}</p>
    </>
  )
}

test("one supplied store scopes app atoms and existing Shell/Scaffold state", () => {
  const first = createStore()
  const second = createStore()
  render(<>
    <section aria-label="First"><ExegiaProvider store={first}><PanelState /></ExegiaProvider></section>
    <section aria-label="Second"><ExegiaProvider store={second}><PanelState /></ExegiaProvider></section>
  </>)
  const a = within(screen.getByRole("region", { name: "First" }))
  const b = within(screen.getByRole("region", { name: "Second" }))
  fireEvent.click(a.getByRole("button", { name: "Open panels" }))
  expect(a.getByText("Shell true")).toBeTruthy()
  expect(a.getByText("Inspector true")).toBeTruthy()
  expect(a.getByRole("button", { name: "Count 7" })).toBeTruthy()
  expect(b.getByText("Shell false")).toBeTruthy()
  expect(b.getByText("Inspector false")).toBeTruthy()
  expect(second.get(countAtom)).toBe(0)
})

function ControlledModal() {
  const [open, setOpen] = useAtom(modalOpenAtom)
  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger>Open modal</ModalTrigger>
      <ModalPopup>
        <ModalTitle>Shared state</ModalTitle>
        <Counter />
        <ModalClose>Close modal</ModalClose>
      </ModalPopup>
    </Modal>
  )
}

test("modal portals preserve the supplied store and controlled open state", async () => {
  const store = createStore()
  const host = document.createElement("div")
  document.body.append(host)
  const view = render(
    <ExegiaProvider store={store} portalContainer={host}>
      <ControlledModal />
    </ExegiaProvider>
  )
  try {
    fireEvent.click(screen.getByRole("button", { name: "Open modal" }))
    const dialog = await screen.findByRole("dialog", { name: "Shared state" })
    expect(host.contains(dialog)).toBe(true)
    expect(store.get(modalOpenAtom)).toBe(true)
    fireEvent.click(within(dialog).getByRole("button", { name: "Count 0" }))
    expect(store.get(countAtom)).toBe(1)
    fireEvent.click(within(dialog).getByRole("button", { name: "Close modal" }))
    await waitFor(() => expect(store.get(modalOpenAtom)).toBe(false))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  } finally {
    view.unmount()
    host.remove()
  }
})

test("toast, tooltip, and popover use root portal defaults with local overrides", async () => {
  const host = document.createElement("div")
  const override = document.createElement("div")
  document.body.append(host, override)
  const manager = ToastPrimitive.createToastManager()
  const view = render(
    <ExegiaProvider portalContainer={host} tooltip={{ delay: 0 }} toast={{ toastManager: manager }}>
      <Tooltip open>
        <TooltipTrigger>Help</TooltipTrigger>
        <TooltipPopup>Shared help</TooltipPopup>
      </Tooltip>
      <Popover open>
        <PopoverTrigger>Details</PopoverTrigger>
        <PopoverPopup portalProps={{ container: override }}>Local destination</PopoverPopup>
      </Popover>
    </ExegiaProvider>
  )
  try {
    expect(host.contains(await screen.findByText("Shared help"))).toBe(true)
    expect(override.contains(await screen.findByText("Local destination"))).toBe(true)
    act(() => { manager.add({ title: "Ready", type: "success" }) })
    expect(host.contains(await screen.findByText("Ready"))).toBe(true)
  } finally {
    view.unmount()
    host.remove()
    override.remove()
  }
})

test("a null portal destination defers mounting until a container is ready", async () => {
  const content = <Modal open><ModalPopup><ModalTitle>Deferred</ModalTitle><ModalClose>Close</ModalClose></ModalPopup></Modal>
  const view = render(<ExegiaProvider portalContainer={null}>{content}</ExegiaProvider>)
  expect(screen.queryByRole("dialog")).toBeNull()
  view.rerender(<ExegiaProvider portalContainer={document.body}>{content}</ExegiaProvider>)
  expect(await screen.findByRole("dialog", { name: "Deferred" })).toBeTruthy()
})
