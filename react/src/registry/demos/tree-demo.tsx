"use client"

import {
  BookOpenIcon,
  FileCode2Icon,
  FileTextIcon,
  FolderIcon,
  LibraryIcon,
  PencilIcon,
  SearchIcon,
  SettingsIcon,
  TagsIcon,
} from "lucide-react"
import * as React from "react"

import { Tree, type ITreeNode, useTree } from "@/components/composed/tree"
import {
  DemoSelect,
  DemoStage,
  DemoToggle,
} from "@/components/docs/demo-controls"
import { Button } from "@/components/ui/button"

/** 3 levels — `navigation` promotes the top level to section names. */
const NAVIGATION: ITreeNode[] = [
  {
    id: "research",
    label: "Research",
    children: [
      { id: "search", label: "Search", icon: <SearchIcon />, href: "#" },
      {
        id: "reading",
        label: "Reading list",
        icon: <BookOpenIcon />,
        href: "#",
        badge: "12",
      },
      {
        id: "library",
        label: "Library",
        icon: <LibraryIcon />,
        children: [
          { id: "manuscripts", label: "Manuscripts", href: "#" },
          { id: "codices", label: "Codices", href: "#" },
          { id: "fragments", label: "Fragments", href: "#" },
        ],
      },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    children: [
      { id: "notes", label: "Notes", icon: <FileTextIcon />, href: "#" },
      { id: "tags", label: "Tags", icon: <TagsIcon />, href: "#" },
    ],
  },
]

const TOC: ITreeNode[] = [
  {
    id: "getting-started",
    label: "Getting started",
    href: "#",
    defaultOpen: true,
    children: [
      { id: "installation", label: "Installation" },
      {
        id: "configuration",
        label: "Configuration",
        children: [
          { id: "theming", label: "Theming" },
          { id: "tokens", label: "Tokens" },
        ],
      },
    ],
  },
  { id: "components", label: "Components", href: "#" },
  { id: "changelog", label: "Changelog", href: "#" },
]

const RAIL: ITreeNode[] = [
  { id: "search", label: "Search", icon: <SearchIcon />, href: "#" },
  { id: "reading", label: "Reading list", icon: <BookOpenIcon />, href: "#" },
  { id: "library", label: "Library", icon: <LibraryIcon />, href: "#" },
  { id: "settings", label: "Settings", icon: <SettingsIcon />, href: "#" },
]

const FILES: ITreeNode[] = [
  {
    id: "src",
    label: "src",
    icon: <FolderIcon />,
    defaultOpen: true,
    children: [
      {
        id: "components",
        label: "components",
        icon: <FolderIcon />,
        children: [
          { id: "tree-tsx", label: "tree.tsx", icon: <FileCode2Icon /> },
          { id: "utils-ts", label: "utils.ts", icon: <FileCode2Icon /> },
        ],
      },
      { id: "index-ts", label: "index.ts", icon: <FileCode2Icon /> },
    ],
  },
  { id: "readme", label: "README.md", icon: <FileTextIcon /> },
]

type TDemoVariant = "navigation" | "toc" | "sidebar" | "files"

const VARIANTS = ["navigation", "toc", "sidebar", "files"] as const

export default function TreeDemo() {
  const [variant, setVariant] = React.useState<TDemoVariant>("navigation")
  const [collapsed, setCollapsed] = React.useState(false)
  const [activeId, setActiveId] = React.useState<string | undefined>("reading")
  // The `files` shape runs off a controller instead of props: it owns the
  // data, so rename and drag-and-drop apply themselves, and the buttons
  // below drive the same tree from outside it.
  const files = useTree({
    treeId: "demo-files",
    variant: "files",
    defaultItems: FILES,
    activeId,
    onNavigate: (node) => setActiveId(node.id),
  })

  function handleVariantChange(next: TDemoVariant) {
    setVariant(next)
    setActiveId(
      next === "toc"
        ? "getting-started"
        : next === "files"
          ? "readme"
          : "reading"
    )
  }

  return (
    <DemoStage
      canvasClassName="flex min-h-80 w-full items-center justify-center p-6"
      controls={
        <>
          <DemoSelect
            label="variant"
            value={variant}
            options={VARIANTS}
            onChange={handleVariantChange}
          />
          {variant === "sidebar" && (
            <DemoToggle
              label="collapsed"
              checked={collapsed}
              onChange={setCollapsed}
            />
          )}
          {variant === "files" && (
            <div className="flex w-full gap-1">
              <Button
                className="flex-1"
                onClick={files.expandAll}
                size="xs"
                variant="outline"
              >
                Expand all
              </Button>
              <Button
                className="flex-1"
                onClick={files.reset}
                size="xs"
                variant="outline"
              >
                Reset
              </Button>
            </div>
          )}
          <span className="text-xs text-muted-foreground">
            {activeId ? `selected: ${activeId}` : "select a row"}
          </span>
        </>
      }
    >
      <div
        className={
          variant === "sidebar" && collapsed
            ? "w-16 rounded-lg border bg-card p-2 shadow-sm"
            : "w-full max-w-64 rounded-lg border bg-card p-2 shadow-sm"
        }
      >
        {variant === "navigation" && (
          <Tree
            activeId={activeId}
            items={NAVIGATION}
            onNavigate={(node) => setActiveId(node.id)}
            treeId="demo-nav"
            variant="navigation"
          />
        )}
        {variant === "toc" && (
          <Tree
            activeId={activeId}
            items={TOC}
            onNavigate={(node) => setActiveId(node.id)}
            variant="toc"
          />
        )}
        {variant === "sidebar" && (
          <Tree
            activeId={activeId}
            collapsed={collapsed}
            items={RAIL}
            onNavigate={(node) => setActiveId(node.id)}
            variant="sidebar"
          />
        )}
        {variant === "files" && (
          <Tree
            tree={files}
            renderTrailing={(node) => (
              <Button
                aria-label={`Rename ${node.label}`}
                onClick={() => files.startRename(node.id)}
                size="icon-xs"
                variant="ghost"
              >
                <PencilIcon className="size-3" />
              </Button>
            )}
          />
        )}
      </div>
    </DemoStage>
  )
}
