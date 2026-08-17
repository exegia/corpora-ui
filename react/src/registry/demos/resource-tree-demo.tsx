import * as React from "react"

import {
  DemoSelect,
  DemoStage,
} from "@/components/docs/demo-controls"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  useAISidebar,
  type SidebarResource,
} from "@/components/blocks/nav/sidebar";

const RESOURCES: SidebarResource[] = [
  {
    id: "corpora",
    label: "Corpora",
    kind: "project",
    children: [
      {
        id: "manuscripts",
        label: "Manuscripts",
        kind: "folder",
        children: [
          { id: "codex-a", label: "Codex Askewianus", kind: "file" },
          { id: "codex-b", label: "Codex Brucianus", kind: "file" },
        ],
      },
      { id: "fragments", label: "Fragments", kind: "folder" },
      { id: "readme", label: "Field notes", kind: "file" },
    ],
  },
  { id: "reading-list", label: "Reading list", kind: "bookmark" },
  { id: "archive", label: "Archive", kind: "folder", disabled: true },
]

const COLLAPSIBLE = ["icon", "offcanvas", "none"] as const
const VARIANTS = ["sidebar", "floating", "inset"] as const

export default function ResourceTreeDemo() {
  const [activeId, setActiveId] = React.useState("codex-a")
  const [collapsible, setCollapsible] =
    React.useState<(typeof COLLAPSIBLE)[number]>("icon")
  const [variant, setVariant] =
    React.useState<(typeof VARIANTS)[number]>("sidebar")
  // The block runs off a controller, so the buttons beside it drive the
  // same tree the rows do.
  const sidebar = useAISidebar({
    defaultItems: RESOURCES,
    defaultExpandedIds: ["corpora", "manuscripts"],
    defaultActiveId: "codex-a",
    onActiveChange: setActiveId,
  })

  return (
    <DemoStage
      controls={
        <>
          <DemoSelect
            value={collapsible}
            options={COLLAPSIBLE}
            onChange={setCollapsible}
          />
          <DemoSelect
            value={variant}
            options={VARIANTS}
            onChange={setVariant}
          />
          <Button onClick={sidebar.expandAll} size="sm" variant="outline">
            Expand all
          </Button>
          <Button onClick={sidebar.collapseAll} size="sm" variant="outline">
            Collapse all
          </Button>
          <Button
            onClick={() =>
              sidebar.selectedId && sidebar.startRename(sidebar.selectedId)
            }
            size="sm"
            variant="outline"
          >
            Rename
          </Button>
          <Badge className="capitalize" variant="outline">{activeId}</Badge>
        </>
      }
      canvasClassName="flex w-full"
    >
      {/* The tree claims no page layout, so the demo supplies the frame. */}
      <div className="flex h-150 w-full overflow-hidden rounded-lg border pt-12">
        <div className="w-64 shrink-0 overflow-y-auto border-r p-2">
          <Sidebar.Wrapper controller={sidebar} />
        </div>
        <div className="grid flex-1 place-items-center p-6 text-center text-sm text-muted-foreground">
          Your page content sits here — the block is the panel only.
        </div>
      </div>
    </DemoStage>
  )
}
