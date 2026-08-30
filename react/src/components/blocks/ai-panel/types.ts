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

export interface WordSelection {
  lemma: string
  partOfSpeech?: string
  pos?: string
  frequency?: number | string
  onViewDetails?: () => void
}

export interface NodeSelection {
  range: string
  nodeIds: string[]
  wordCount: number
}

export type { ComposerMode, DiffRow } from "@/components/composed/ai/types"

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
