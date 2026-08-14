import {
  RiBook2Line,
  RiCloseLine,
  RiCompass3Line,
  RiInformationLine,
  RiSearchLine,
} from "@remixicon/react"
import * as React from "react"

import {
  Scaffold,
  type ScaffoldPanelProps,
  useScaffold,
} from "@/components/blocks/scaffold"
import { DemoStage } from "@/components/docs/demo-controls"
import { cn } from "@/lib/utils"

interface DemoPanel extends ScaffoldPanelProps {
  title: string | undefined
  id: number
}

const PANEL_TITLES = [
  "Transcription",
  "Collation",
  "Apparatus",
  "Translation",
  "Commentary",
]

/** Visible-panel capacity — the design allows 3 (viewport-dependent). */
const PANEL_CAPACITY = 3

export default function ScaffoldDemo() {
  const scaffold = useScaffold()
  const nextId = React.useRef(2)
  // Visible panels plus the non-visible ones (newest first) that the
  // action cluster counts as its overflow badge.
  const [board, setBoard] = React.useState<{
    visible: DemoPanel[]
    hidden: DemoPanel[]
  }>({
    visible: [{
      id: 1,
      children: <PanelContent label={PANEL_TITLES[0]} />,
      SecondaryPanel: <StripContent label={PANEL_TITLES[0]} />,
      title: undefined,
    }],
    hidden: [],
  })

  // Per the design comments: at capacity the new panel is prepended, and
  // the last visible panel is pushed into the overflow dropdown.
  const addPanel = () => {
    const id = nextId.current++
    const panel: DemoPanel = {
      children: <PanelContent label={PANEL_TITLES[(id - 1) % PANEL_TITLES.length]} />,
      SecondaryPanel: <StripContent label={PANEL_TITLES[(id - 1) % PANEL_TITLES.length]} />,
      id,
      title: PANEL_TITLES[(id - 1) % PANEL_TITLES.length]

    }
    setBoard(({ visible, hidden }) =>
      visible.length < PANEL_CAPACITY
        ? { visible: [...visible, panel], hidden }
        : {
            visible: [panel, ...visible.slice(0, -1)],
            hidden: [visible[visible.length - 1], ...hidden],
          }
    )
  }

  // Closing a panel frees capacity — the newest overflowed panel returns.
  const closePanel = (id: number) =>
    setBoard(({ visible, hidden }) => {
      const next = visible.filter((panel) => panel.id !== id)
      if (next.length === visible.length) return { visible, hidden }
      const [restored, ...rest] = hidden
      return restored
        ? { visible: [...next, restored], hidden: rest }
        : { visible: next, hidden }
    })

  const swapPanel = (id: number) =>
    setBoard(({ visible, hidden }) => ({
      visible: visible.map((panel) =>
        panel.id === id ? { ...panel, swapped: !panel.swapped } : panel
      ),
      hidden,
    }))

  const panels = board.visible
  const overflow = board.hidden

  return (
    <DemoStage canvasClassName="w-full p-0" controls={null}>
      <div className="h-130 w-full overflow-hidden rounded-lg border">
        <Scaffold.Root {...scaffold.providerProps}>
          <Scaffold.Sidebar>
            <RailButton icon={<RiCompass3Line className="size-5" />} label="Explore" />
            <RailButton icon={<RiBook2Line className="size-5" />} label="Manuscripts" />
            <RailButton icon={<RiSearchLine className="size-5" />} label="Search" />
            <div className="flex-1" />
            <RailButton
              active={scaffold.inspectorOpen}
              icon={<RiInformationLine className="size-5" />}
              label="Toggle inspector"
              onClick={scaffold.toggleInspector}
            />
          </Scaffold.Sidebar>

          <Scaffold.Main>
            <Scaffold.Actions
              onAdd={addPanel}
              overflowCount={
                panels.length + overflow.length > 1
                  ? overflow.length
                  : undefined
              }
            />

            <Scaffold.Canvas>
              {panels.map((panel) => (
                <Scaffold.Panel
                  key={panel.id}
                  SecondaryPanel={panel.SecondaryPanel}
                  name={panel.title}
                  onClose={
                    panels.length > 1 ? () => closePanel(panel.id) : undefined
                  }
                  onSwap={() => swapPanel(panel.id)}
                >
                  {panel.children}
                </Scaffold.Panel>
              ))}
            </Scaffold.Canvas>

            <Scaffold.Inspector>
              <div className="flex h-14 shrink-0 items-center justify-between px-4">
                <span className="text-sm font-semibold">Inspector</span>
                <button
                  aria-label="Close inspector"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => scaffold.setInspectorOpen(false)}
                  type="button"
                >
                  <RiCloseLine className="size-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1 space-y-4 overflow-auto px-4 pb-4">
                {[
                  { label: "Shelfmark", value: "Add. MS 43725" },
                  { label: "Provenance", value: "Saint Catherine's Monastery" },
                  { label: "Script", value: "Biblical majuscule" },
                  { label: "Folios", value: "347" },
                ].map((field) => (
                  <div key={field.label}>
                    <div className="text-xs text-muted-foreground">
                      {field.label}
                    </div>
                    <div className="mt-1 text-sm">{field.value}</div>
                  </div>
                ))}
              </div>
            </Scaffold.Inspector>
          </Scaffold.Main>
        </Scaffold.Root>
      </div>
    </DemoStage>
  )
}

function RailButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        "flex size-10 items-center justify-center rounded-xl text-neutral-600 transition-[background-color,color,scale] duration-150 ease-smooth-out hover:bg-white/60 hover:text-neutral-900 active:scale-97 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white motion-reduce:transition-none motion-reduce:active:scale-100",
        active &&
          "bg-white/80 text-neutral-900 shadow-xs dark:bg-white/15 dark:text-white"
      )}
      onClick={onClick}
      type="button"
    >
      {icon}
    </button>
  )
}

function PanelContent({ label }: { label: string }) {
  return (
    <div className="flex h-full flex-col p-4">
      <div className="text-sm font-semibold">{label}</div>
      <div className="mt-3 grid gap-2">
        {["α", "β", "γ"].map((line) => (
          <div
            className="rounded-xl bg-white/70 px-3 py-2.5 text-xs text-neutral-500 dark:bg-white/5 dark:text-neutral-400"
            key={line}
          >
            Witness {line} — fol. 12r, lines 3–9
          </div>
        ))}
      </div>
    </div>
  )
}

function StripContent({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center px-4 text-xs text-neutral-500 dark:text-neutral-400">
      {label}
    </div>
  )
}
