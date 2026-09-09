import type * as React from "react"

import type { ComposerAttachment } from "./composer-attachments-atom"

export type ComposerMode = "answer" | "fix" | "ask"

export type SuggestionState = "accepted" | "rejected" | "pending"

export interface DiffRow {
  type: "add" | "remove"
  value: React.ReactNode
  field?: string
}

export interface ReferenceBase {
  id: string
  title?: string
  url?: string
}

export interface AISuggestionBase {
  heading: string
  description?: string | React.ReactNode
  state?: SuggestionState
  updatedAt?: string
  references?: ReferenceBase[] | ReferenceBase
}


export interface ComposerProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  mode?: ComposerMode
  defaultMode?: ComposerMode
  onModeChange?: (mode: ComposerMode) => void
  onSend?: (value: string, mode: ComposerMode, attachments: ComposerAttachment[]) => void
  /**
   * Key for the attachment tray atoms. Unnamed composers key off `useId()`
   * and drop their tray on unmount; a named one survives a remount.
   */
  composerId?: string
  /** Seeds the tray once on mount; the atoms own it from then on. */
  defaultAttachments?: ComposerAttachment[]
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
  /**
   * `SuggestedPrompt` rows shown in a "Suggestions (n)" disclosure above the
   * field, their panel tucked behind the pill. Omitted, no disclosure renders.
   */
  suggestedPrompts?: React.ReactNode
  suggestionsLabel?: (count: number) => React.ReactNode
  defaultSuggestionsOpen?: boolean
  suggestionsOpen?: boolean
  onSuggestionsOpenChange?: (open: boolean) => void
  className?: string
}
