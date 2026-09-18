"use client"

import {
  BookOpenIcon,
  FileCode2Icon,
  FileTextIcon,
  FolderIcon,
  LibraryIcon,
  SearchIcon,
  SettingsIcon,
  TagsIcon,
  Trash2Icon,
} from "lucide-react"
import * as React from "react"

import { Tree, type ITreeNode, useTree } from "@/components/composed/tree"
import { DemoStage } from "@/components/docs/demo-controls"
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

export default function TreeDemo() {
  const [variant] = React.useState<TDemoVariant>("navigation")
  const [collapsed] = React.useState(false)
  const [activeId, setActiveId] = React.useState<string | undefined>("reading")
  // The `files` shape runs off a controller instead of props: it owns the
  // data, so rename and drag-and-drop apply themselves, and the buttons
  // below drive the same tree from outside it.
  const files = useTree({
    variant: "files",
    defaultItems: FILES,
    activeId,
    onNavigate: (node) => setActiveId(node.id),
  })
  return (
    <DemoStage canvasClassName="flex w-full justify-center">
      <div
        className={
          variant === "sidebar" && collapsed
            ? "w-16 p-2 rounded-lg border"
            : "max-w-64 p-2 w-full rounded-lg border"
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
                aria-label={`Delete ${node.label}`}
                size="icon-xs"
                variant="ghost"
              >
                <Trash2Icon className="size-3" />
              </Button>
            )}
          />
        )}
      </div>
    </DemoStage>
  )
}
