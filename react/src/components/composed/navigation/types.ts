import type { TreeNodeType } from "@/components/ui/tree-view"
import type { ReactNode } from "react"

export type TNodeType =
  | "book"
  | "section"
  | "chapter"
  | "verse"
  | "paragraph"
  | "surah"
  | "sentence"
  | "clause"
  | "word"
export type TNodeLevel = 1 | 2 | 3 | 4 | 5 | 6
export type TViewMode = "list" | "grid"

type TNodeTypesByLevel = {
  1: "book" | "section"
  2: "section" | "chapter"
  3: "chapter" | "paragraph"
  4: "verse" | "surah" | "paragraph"
  5: "paragraph" | "sentence" | "clause"
  6: "sentence" | "clause" | "word"
}

export type TNodeLevelDefinition<
  L extends TNodeLevel = TNodeLevel,
  T extends TNodeType = TNodeType,
> = {
  [Level in L]: {
    level: Level
    type: Extract<TNodeTypesByLevel[Level], T>
  }
}[L]

export type TLink<
  N extends TNodeType = TNodeType,
  C extends string = `#${string}-${N}`,
> = C extends `#${string}-${N}` ? C : never

export type TBaseItem<
  L extends TNodeLevel = TNodeLevel,
  Section extends TNodeType = TNodeType,
> = {
  id: string
  label: ReactNode
  link: TLink<Section>
  level: L
  type: Section
}

export type TTocItem = TBaseItem & {
  description?: string
  nodes?: TTocItem[]
}

export interface ITocProps<T extends TTocItem = TTocItem> {
  items: T[]
  activeLink?: T
  onLinkClick?: (link: T) => void
  renderSection?: (item: T) => ReactNode
}

export interface TocTreeNodeProps {
  activeLink?: TTocItem
  inGrid?: boolean
  indexPath: number[]
  node: TTocTreeNode
  onLinkClick?: (link: TTocItem) => void
  supportsGridView: boolean
  viewMode: TViewMode
}

export type TTocTreeNode<T extends TTocItem = TTocItem> = Omit<
  TreeNodeType,
  "children"
> & {
  href: string
  item: T
  children?: TTocTreeNode<T>[]
}

export type TTocCollectionNode<T extends TTocItem = TTocItem> =
  | TTocTreeNode<T>
  | (Omit<TreeNodeType, "children"> & { children?: TTocTreeNode<T>[] })
