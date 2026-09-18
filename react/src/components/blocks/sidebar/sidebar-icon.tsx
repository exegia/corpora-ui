import type { ISidebarResource } from "./type.ts"
import { Bookmark, FileText, Folder, FolderOpen } from "lucide-react"

export function SidebarIcon(item: ISidebarResource, expanded: boolean) {
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
