import type * as React from "react"
import type { IComposerProps } from "@/components/composed/chat/composer"

export type TAiScopeKind =
  "word" | "passage" | "articulus" | "quaestio" | "corpus"

export interface IAiScope {
  kind: TAiScopeKind
  label: string
  /** Reader location shown after a normal word/node scope. */
  location?: string
  range?: string
  nodeId?: string
  nodeIds?: string[]
  pinned?: boolean
}

export interface IRecommendationStackProps
  extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode
}

export interface IPinnedThreadBannerProps {
  className?: string
}

export interface IDegradedBannerProps {
  reason?: React.ReactNode
  onRetry?: () => void
  className?: string
}

// The reader selection shapes moved with `SelectionPopover` to
// `composed/reader`; re-exported so the block's surface stays whole.
export type { INodeSelection, IWordSelection } from "@/components/composed/reader"

export interface IAiPanelProps extends Omit<
  React.ComponentPropsWithoutRef<"aside">,
  "title"
> {
  scope: IAiScope
  onNewThread?: () => void
  onScopeChange?: (kind: IAiScope["kind"]) => void
  onRemoveScope?: () => void
  thread?: React.ReactNode
  /** Transient confirmation (e.g. ApplyToast), anchored to the bottom of the
   * thread and sized slightly narrower than the composer. */
  toast?: React.ReactNode
  prompts?: string[]
  onPromptSelect?: (prompt: string) => void
  composerProps?: IComposerProps
  scopePickerOpen?: boolean
  onScopePickerOpenChange?: (open: boolean) => void
  locked?: boolean
  headerTitle?: string
}

export interface IAiPanelHeaderProps {
  title: string
  /** Shows the lock affordance and its “Published corpus” tooltip. */
  locked?: boolean
  onNewThread?: () => void
}

export type { TComposerMode } from "@/components/composed/chat/composer"
export type { IDiffRow, TSuggestionState } from "@/components/composed/ai/types"

export interface IVersionHistoryEntry {
  id?: string
  responseId: string
  applyingUser?: string
  nodeId: string
  previousValue: string
  nextValue?: string
  timestamp: string | Date
  version: string
  action?: "apply" | "revert"
}

export interface ISuggestedPromptsProps {
  prompts?: string[]
  onSelect?: (prompt: string) => void
  emptyLabel?: string
  className?: string
}

export interface IVersionHistoryRecordProps {
  entry: IVersionHistoryEntry
  className?: string
}


export interface ILockedBannerProps {
  children?: React.ReactNode
  className?: string
}