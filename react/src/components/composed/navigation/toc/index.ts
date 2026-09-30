"use client"

import { Canonical, CanonItem } from "./canon"
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
  Canonical,
  CanonItem,
  Section: DefaultSection,
  Toggle: TocViewModeToggle,
  TreeNode: TocTreeNode,
}

