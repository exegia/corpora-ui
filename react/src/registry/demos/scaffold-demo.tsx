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
  SCAFFOLD_PANEL_CAPACITY,
  useScaffold,
} from "@/components/blocks/scaffold"
import { DemoStage } from "@/components/docs/demo-controls"
import { cn } from "@/lib/utils"

interface DemoPanel {
  id: number
  title: string
  /** The seam menu's Close action hides the strip; the panel body offers
   * a link to bring it back. */
  stripHidden?: boolean
}

const PANEL_TITLES = [
  "Transcription",
  "Collation",
  "Apparatus",
  "Translation",
  "Commentary",
]

export default function ScaffoldDemo() {
  const scaffold = useScaffold()
  const nextId = React.useRef(2)
  const [panels, setPanels] = React.useState<DemoPanel[]>([
    { id: 1, title: PANEL_TITLES[0] },
  ])

  // The canvas caps at SCAFFOLD_PANEL_CAPACITY — Actions hides its Add
  // segment at that point, so this guard only backstops it.
  const addPanel = () => {
    const id = nextId.current++
    const title = PANEL_TITLES[(id - 1) % PANEL_TITLES.length]
    setPanels((panels) =>
      panels.length < SCAFFOLD_PANEL_CAPACITY
        ? [...panels, { id, title }]
        : panels
    )
  }

  // The last panel never closes — its tab and panel drop their close
  // affordances, so this guard only backstops them.
  const closePanel = (id: number) =>
    setPanels((panels) =>
      panels.length > 1 ? panels.filter((panel) => panel.id !== id) : panels
    )

  // The panel trades the two cards itself — a real app would flip the
  // slot content here so each card carries its subject to its new home.
  const swapPanel = () => {}

  const setStripHidden = (id: number, stripHidden: boolean) =>
    setPanels((panels) =>
      panels.map((panel) =>
        panel.id === id ? { ...panel, stripHidden } : panel
      )
    )

  return (
    <DemoStage canvasClassName="w-full p-0" controls={null}>
      <div className="h-130 w-full overflow-hidden rounded-lg border">
        <Scaffold.Root {...scaffold.providerProps}>
          <Scaffold.Sidebar>
            <RailButton
              icon={<RiCompass3Line className="size-5" />}
              label="Explore"
            />
            <RailButton
              icon={<RiBook2Line className="size-5" />}
              label="Manuscripts"
            />
            <RailButton
              icon={<RiSearchLine className="size-5" />}
              label="Search"
            />
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
              onAdd={
                panels.length < SCAFFOLD_PANEL_CAPACITY ? addPanel : undefined
              }
            >
              {panels.map((panel) => (
                <Scaffold.Tab
                  key={panel.id}
                  closeLabel={`Close ${panel.title}`}
                  onClose={
                    panels.length > 1 ? () => closePanel(panel.id) : undefined
                  }
                >
                  {panel.title}
                </Scaffold.Tab>
              ))}
            </Scaffold.Actions>

            <Scaffold.Canvas>
              {panels.map((panel) => (
                <Scaffold.Panel
                  key={panel.id}
                  SecondaryPanel={
                    panel.stripHidden ? undefined : (
                      <StripContent label={panel.title} />
                    )
                  }
                  name={panel.title}
                  onCloseSecondary={() => setStripHidden(panel.id, true)}
                  onSwap={swapPanel}
                >
                  <PanelContent
                    label={panel.title}
                    onShowSubPanel={
                      panel.stripHidden
                        ? () => setStripHidden(panel.id, false)
                        : undefined
                    }
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
        "flex size-10 items-center justify-center rounded-xl text-neutral-600 transition-[background-color,color,scale] duration-150 ease-smooth-out hover:bg-white/60 hover:text-neutral-900 active:scale-97 motion-reduce:transition-none motion-reduce:active:scale-100 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white",
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

function PanelContent({
  label,
  onShowSubPanel,
}: {
  label: string
  /** Present while the strip is hidden — renders the restore link. */
  onShowSubPanel?: () => void
}) {
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
      {onShowSubPanel && (
        <button
          className="mt-auto self-start pt-3 text-xs text-neutral-500 underline underline-offset-2 transition-colors duration-150 ease-smooth-out hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          onClick={onShowSubPanel}
          type="button"
        >
          Show subpanel
        </button>
      )}
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
