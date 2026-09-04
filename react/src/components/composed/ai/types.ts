import type * as React from "react"

export type ComposerMode = "answer" | "fix" | "ask"

export type SuggestionState = "accepted" | "rejected" | "pending"

export interface DiffRow {
  type: "add" | "remove"
  value: React.ReactNode
  field?: string
}


export interface ComposerProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  mode?: ComposerMode
  defaultMode?: ComposerMode
  onModeChange?: (mode: ComposerMode) => void
  onSend?: (value: string, mode: ComposerMode) => void
  /** Start in the tall, focused layout. */
  expanded?: boolean
  onStop?: () => void
  isStreaming?: boolean
  disabled?: boolean
  /** Attach affordance — the "+" button. Hidden when omitted. */
  onAttach?: () => void
  attachLabel?: string
  sendLabel?: React.ReactNode
  stopLabel?: React.ReactNode
  safetyNote?: React.ReactNode
  placeholder?: string
  className?: string
}
