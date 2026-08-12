import type { SidebarResource } from "@/components/agents/type.ts"
import { Bookmark, FileText, Folder, FolderOpen } from "lucide-react"

export function SidebarIcon(item: SidebarResource, expanded: boolean) {
  const Icon =
    item.kind === "folder" || item.kind === "project"
      ? expanded
        ? FolderOpen
        : Folder
      : item.kind === "bookmark"
        ? Bookmark
        : FileText
  return <Icon className="size-4" />
}
