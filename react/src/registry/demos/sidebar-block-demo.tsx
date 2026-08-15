import {
  BookOpenIcon,
  FileTextIcon,
  LibraryIcon,
  SearchIcon,
  SettingsIcon,
  SparklesIcon,
  TagsIcon,
} from "lucide-react"
import * as React from "react"

import {
  SidebarBlock,
  type SidebarNavSection,
} from "@/components/blocks/nav/sidebar-block"
import { ProfileCardBlock } from "@/components/blocks/profile/profile-card-block"
import {
  DemoBrandMark,
  DemoSelect,
  DemoStage,
} from "@/components/docs/demo-controls"
import { Badge } from "@/components/ui/badge"

const SECTIONS: SidebarNavSection[] = [
  {
    id: "work",
    label: "Research",
    items: [
      { id: "search", label: "Search", icon: <SearchIcon /> },
      {
        id: "reading",
        label: "Reading list",
        icon: <BookOpenIcon />,
        badge: "12",
      },
      {
        id: "library",
        label: "Library",
        icon: <LibraryIcon />,
        items: [
          { id: "library-manuscripts", label: "Manuscripts" },
          { id: "library-codices", label: "Codices" },
          { id: "library-fragments", label: "Fragments" },
        ],
      },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { id: "notes", label: "Notes", icon: <FileTextIcon /> },
      { id: "tags", label: "Tags", icon: <TagsIcon /> },
      { id: "settings", label: "Settings", icon: <SettingsIcon /> },
      {
        id: "whats-new",
        label: "What's new",
        icon: <SparklesIcon />,
        href: "https://example.com/changelog",
        target: "_blank",
      },
    ],
  },
]

const COLLAPSIBLE = ["icon", "offcanvas", "none"] as const
const VARIANTS = ["sidebar", "floating", "inset"] as const

export default function SidebarBlockDemo() {
  const [activeId, setActiveId] = React.useState("reading")
  const [collapsible, setCollapsible] =
    React.useState<(typeof COLLAPSIBLE)[number]>("icon")
  const [variant, setVariant] =
    React.useState<(typeof VARIANTS)[number]>("sidebar")

  return (
    <DemoStage
      controls={
        <>
          <DemoSelect
            label="collapsible"
            value={collapsible}
            options={COLLAPSIBLE}
            onChange={setCollapsible}
          />
          <DemoSelect
            label="variant"
            value={variant}
            options={VARIANTS}
            onChange={setVariant}
          />
          <Badge variant="outline">{activeId}</Badge>
        </>
      }
      canvasClassName="flex w-full justify-center"
    >
      {/* The block claims no page layout, so the demo supplies the frame. */}
      <div className="flex h-104 w-full max-w-2xl overflow-hidden rounded-lg border">
        <SidebarBlock
          activeId={activeId}
          collapsible={collapsible}
          footer={
            <ProfileCardBlock
              side="top"
              user={{ name: "Jenny Hamilton", username: "@jennycodes" }}
            />
          }
          header={
            <span className="flex items-center gap-2 px-1">
              <span className="size-6 shrink-0">
                <DemoBrandMark />
              </span>
              <span className="truncate text-sm font-medium">Corpora</span>
            </span>
          }
          onNavigate={(item) => setActiveId(item.id)}
          sections={SECTIONS}
          variant={variant}
        />
        <div className="grid flex-1 place-items-center p-6 text-center text-sm text-muted-foreground">
          Your page content sits here — the block is the panel only.
        </div>
      </div>
    </DemoStage>
  )
}
