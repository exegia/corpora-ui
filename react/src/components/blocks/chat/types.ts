import type * as React from "react"
import type { IComposerProps } from "@/components/composed/chat/composer"

export type AiScopeKind =
  "word" | "passage" | "articulus" | "quaestio" | "corpus"

export interface AiScope {
  kind: AiScopeKind
  label: string
  /** Reader location shown after a normal word/node scope. */
  location?: string
  range?: string
  nodeId?: string
  nodeIds?: string[]
  pinned?: boolean
}

export interface RecommendationStackProps
  extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode
}

export interface PinnedThreadBannerProps {
  className?: string
}

export interface DegradedBannerProps {
  reason?: React.ReactNode
  onRetry?: () => void
  className?: string
}

// The reader selection shapes moved with `SelectionPopover` to
// `composed/reader`; re-exported so the block's surface stays whole.
export type { NodeSelection, WordSelection } from "@/components/composed/reader"

export interface AiPanelProps extends Omit<
  React.ComponentPropsWithoutRef<"aside">,
  "title"
> {
  scope: AiScope
  onNewThread?: () => void
  onScopeChange?: (kind: AiScope["kind"]) => void
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

export interface AiPanelHeaderProps {
  title: string
  /** Shows the lock affordance and its “Published corpus” tooltip. */
  locked?: boolean
  onNewThread?: () => void
}

export type { ComposerMode } from "@/components/composed/chat/composer"
export type { DiffRow, SuggestionState } from "@/components/composed/ai/types"

export interface VersionHistoryEntry {
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

export interface SuggestedPromptsProps {
  prompts?: string[]
  onSelect?: (prompt: string) => void
  emptyLabel?: string
  className?: string
}

export interface VersionHistoryRecordProps {
  entry: VersionHistoryEntry
  className?: string
}


export interface LockedBannerProps {
  children?: React.ReactNode
  className?: string
}