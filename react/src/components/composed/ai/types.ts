import type * as React from "react"

export type ComposerMode = "answer" | "fix" | "ask"

export type SuggestionState = "accepted" | "rejected" | "pending"

export interface DiffRow {
  type: "add" | "remove"
  value: React.ReactNode
  field?: string
}
