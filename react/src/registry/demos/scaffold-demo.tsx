import {
  RiBook2Line,
  RiCloseLine,
  RiCompass3Line,
  RiInformationLine,
  RiSearchLine,
} from "@remixicon/react"
import * as React from "react"

import { Scaffold, useScaffold } from "@/components/blocks/scaffold"
import { DemoStage } from "@/components/docs/demo-controls"
import { cn } from "@/lib/utils"

interface DemoPanel {
  id: number
  title: string
  swapped: boolean
}

const PANEL_TITLES = ["Transcription", "Collation", "Apparatus"]

export default function ScaffoldDemo() {
  const scaffold = useScaffold()
  const nextId = React.useRef(2)
  const [panels, setPanels] = React.useState<DemoPanel[]>([
    { id: 1, title: PANEL_TITLES[0], swapped: false },
  ])

  const addPanel = () =>
    setPanels((prev) =>
      prev.length >= 3
        ? prev
        : [
            ...prev,
            {
              id: nextId.current++,
              title: PANEL_TITLES[prev.length] ?? "Panel",
              swapped: false,
            },
          ]
    )

  const closePanel = (id: number) =>
    setPanels((prev) => prev.filter((panel) => panel.id !== id))

  const swapPanel = (id: number) =>
    setPanels((prev) =>
      prev.map((panel) =>
        panel.id === id ? { ...panel, swapped: !panel.swapped } : panel
      )
    )

  return (
    <DemoStage canvasClassName="w-full p-0" controls={null}>
      <div className="h-[520px] w-full overflow-hidden rounded-lg border">
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
              count={panels.length > 1 ? panels.length : undefined}
              onAdd={addPanel}
            />

            <Scaffold.Canvas>
              {panels.map((panel) => (
                <Scaffold.Panel
                  key={panel.id}
                  name={panel.title}
                  onClose={
                    panels.length > 1 ? () => closePanel(panel.id) : undefined
                  }
                  onSwap={() => swapPanel(panel.id)}
                  secondary={
                    <StripContent
                      label={panel.swapped ? panel.title : "Notes"}
                    />
                  }
                >
                  <PanelContent
                    label={panel.swapped ? "Notes" : panel.title}
                  />
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
