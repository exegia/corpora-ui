import type { ReactNode } from "react"
import type { TreeNodeType } from "@/components/ui/tree-view"
import type { OSIS_BOOKS } from "@/lib/canonical"

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
export type TTocKind = "canon" | "regular"

export type TLink<N extends TNodeType = TNodeType> = `#${string}-${N}`

export interface TBaseItem<
  L extends TNodeLevel = TNodeLevel,
  T extends TNodeType = TNodeType,
> {
  readonly id: string
  readonly label: ReactNode
  readonly link: TLink<T>
  readonly level: L
  readonly type: T
}

interface TTocItemFields {
  readonly description?: ReactNode
  readonly nodes?: readonly TTocItem[]
}

export type TTocItem<L extends TNodeLevel = TNodeLevel> = {
  [T in TNodeType]: TBaseItem<L, T>
}[TNodeType] &
  TTocItemFields

export type TCanonNode<T extends TNodeType = TNodeType> = Exclude<
  T,
  "paragraph"
>
export type TBookAbbreviation = keyof typeof OSIS_BOOKS

type TSubCanonNodeType<T extends TCanonNode> = T extends "book"
  ? "section" | "chapter"
  : T extends "section"
    ? "book" | "chapter" | "verse" | "surah"
    : T extends "chapter"
      ? "verse" | "surah"
      : T extends "verse" | "surah"
        ? "sentence" | "clause"
        : T extends "sentence"
          ? "clause" | "word"
          : T extends "clause"
            ? "word"
            : never

export type TCanonItem<
  N extends number = number,
  Abbr extends TBookAbbreviation = TBookAbbreviation,
  T extends TCanonNode = TCanonNode,
> = T extends TCanonNode
  ? TBaseItem<TNodeLevel, T> & {
      readonly description?: ReactNode
      readonly nodes?: T extends "word"
        ? never
        : readonly TCanonItem<N, Abbr, TSubCanonNodeType<T>>[]
    } & (T extends "book"
        ? { readonly abbreviation: Abbr; readonly number?: N }
        : T extends "section"
          ? { readonly abbreviation?: Abbr; readonly number?: N }
          : { readonly abbreviation?: Abbr; readonly number: N })
  : never

export type TTocUnionItem<K extends TTocKind = TTocKind> = K extends "canon"
  ? TCanonItem
  : TTocItem

export interface ITocProps<K extends TTocKind = "regular"> {
  readonly items: readonly TTocUnionItem<K>[]
  readonly activeLink?: TTocUnionItem<K>
  readonly onLinkClick?: (item: TTocUnionItem<K>) => void
    readonly renderSection?: (item: TTocUnionItem<K>) => ReactNode
    readonly description?: ReactNode
  readonly kind?: K
}

export interface ITocItemProps<K extends TTocKind = "regular"> {
  readonly indexPath: number[]
  readonly node: TTocUnionItem<K>
  readonly onLinkClick?: (item: TTocUnionItem<K>) => void
}

export interface DefaultSectionProps<K extends TTocKind = TTocKind> {
  readonly item: TTocUnionItem<K>
}

export type TTocTreeNode = Omit<TreeNodeType, "children"> & {
  href: string
  item: TTocItem
  children?: TTocTreeNode[]
}

export type TTocCollectionNode =
  | TTocTreeNode
  | {
      id: string
      name: string
      children: TTocTreeNode[]
    }

export interface TocTreeNodeProps {
  readonly activeLink?: TTocItem
  readonly indexPath: number[]
  readonly node: TTocTreeNode
  readonly onLinkClick?: (item: TTocItem) => void
}

export interface CanonItemProps {
  readonly item: TCanonItem
  readonly active?: boolean
  readonly expanded?: boolean
  readonly onLinkClick?: (item: TCanonItem) => void
}

export interface TocViewModeToggleProps {
  readonly viewMode: TViewMode
  readonly onValueChange: (value: TViewMode) => void
}
