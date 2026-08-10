import {
  BookOpenIcon,
  FileTextIcon,
  FolderIcon,
  HomeIcon,
  LibraryIcon,
  SearchIcon,
  SettingsIcon,
  SparklesIcon,
} from "lucide-react"
import * as React from "react"

import { ShellLayout } from "@/components/blocks/shell/shell-layout"
import { ProfileCardBlock } from "@/components/blocks/profile/profile-card-block"
import type { SidebarNavSection } from "@/components/blocks/nav/sidebar-block"
import { DemoBrandMark, DemoStage } from "@/components/docs/demo-controls"

const SECTIONS: SidebarNavSection[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { id: "home", label: "Home", icon: <HomeIcon /> },
      { id: "projects", label: "Projects", icon: <FolderIcon />, badge: "8" },
      {
        id: "library",
        label: "Library",
        icon: <LibraryIcon />,
        defaultOpen: true,
        items: [
          { id: "manuscripts", label: "Manuscripts" },
          { id: "codices", label: "Codices" },
          { id: "fragments", label: "Fragments" },
        ],
      },
    ],
  },
  {
    id: "research",
    label: "Research",
    items: [
      { id: "search", label: "Search", icon: <SearchIcon /> },
      { id: "reading", label: "Reading list", icon: <BookOpenIcon /> },
      { id: "notes", label: "Notes", icon: <FileTextIcon /> },
      { id: "settings", label: "Settings", icon: <SettingsIcon /> },
    ],
  },
]

export default function ShellDemo() {
  const [activeId, setActiveId] = React.useState("manuscripts")

  return (
    <DemoStage controls={null} canvasClassName="w-full p-0">
      <div className="h-[42rem] w-full overflow-hidden rounded-lg border bg-background">
        <ShellLayout
          activeId={activeId}
          className="min-h-full"
          contentClassName="my-2 mr-2"
          onNavigate={(item) => setActiveId(item.id)}
          sections={SECTIONS}
          sidebarFooter={
            <ProfileCardBlock
              side="top"
              user={{ name: "Jenny Hamilton", username: "@jennycodes" }}
            />
          }
          title="Manuscript research"
          workspace={{
            name: "Corpora",
            meta: "Alexandria workspace",
            logo: <DemoBrandMark />,
          }}
        >
          <div className="grid gap-5">
            <div className="grid gap-5 lg:grid-cols-3">
              <DashboardCard label="Sources indexed" value="12,842" />
              <DashboardCard label="Open annotations" value="248" />
              <DashboardCard label="New insights" value="37" />
            </div>
            <div className="rounded-2xl border bg-background/70 p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold">Active collection</h2>
                  <p className="text-sm text-muted-foreground">
                    Test the collapsible sidebar, nested navigation, and mobile drawer.
                  </p>
                </div>
                <SparklesIcon className="size-5 text-muted-foreground" />
              </div>
              <div className="grid gap-3">
                {[
                  "Codex Sinaiticus collation",
                  "P.Oxy fragment review",
                  "Marginalia extraction queue",
                ].map((item) => (
                  <div
                    className="rounded-xl border bg-card px-4 py-3 text-sm"
                    key={item}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ShellLayout>
      </div>
    </DemoStage>
  )
}

function DashboardCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-background/70 p-5 shadow-sm">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  )
}