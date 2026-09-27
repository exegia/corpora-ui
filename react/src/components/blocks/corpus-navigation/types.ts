import type { ComponentProps, ReactNode } from "react"
import type { DrawerPopup } from "@/components/ui/drawer"
import type {
  CorpusNavigationOptions,
  CorpusNavigationState,
} from "@/components/composed/corpus-navigation/types"
import type { ReferenceShortcut } from "@/components/composed/corpus-navigation/use-reference-shortcut"
export type NavigationPresentation = "wide" | "medium" | "compact"
export interface CorpusNavigatorProps extends CorpusNavigationOptions {
  children?: ReactNode | ((state: CorpusNavigationState) => ReactNode)
  corpusSlot?: ReactNode
  contextSlot?: ReactNode
  shortcut?: ReferenceShortcut
  portalProps?: ComponentProps<typeof DrawerPopup>["portalProps"]
  className?: string
}
