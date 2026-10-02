"use client"

import { Canonical, CanonItem } from "./canon"
import { Compact } from "./compact"
export type { CompactTocProps } from "./compact"

import { Root } from "./default"
import { DefaultSection } from "./section"
import { TocTreeNode } from "./tree-node"

import { TocViewModeToggle } from "./toggle"
export type {
  TNodeType,
  TNodeLevel,
  TViewMode,
  TTocKind,
  TLink,
  TBaseItem,
  TTocItem,
  TCanonNode,
  TBookAbbreviation,
  TCanonItem,
  TTocUnionItem,
  ITocProps,
  ITocItemProps,
  DefaultSectionProps,
  TTocTreeNode,
  TTocCollectionNode,
  TocTreeNodeProps,
  CanonItemProps,
  TocViewModeToggleProps,
} from "./types"

export const TOC = {
  Root,
  Compact,
  Canonical,
  CanonItem,
  Section: DefaultSection,
  Toggle: TocViewModeToggle,
  TreeNode: TocTreeNode,
}

export default TOC

export { useCanon } from "./use-canon"
export {
  canonSelectedLinkAtom,
  canonExpandedIdsAtom,
  canonActiveSectionIdAtom,
  canonStateAtom,
  selectCanonItemAtom,
  setCanonSectionAtom,
  resetCanonAtom,
  removeCanonInstance,
} from "./canon-atom"
export type { CanonState, CanonProps, CanonContextMenuItem, CanonContextMenuItems } from "./types"
