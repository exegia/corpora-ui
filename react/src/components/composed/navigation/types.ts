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

export type TBaseItem<L extends TNodeLevel = TNodeLevel, Section extends TNodeType = TNodeType> = {
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
}