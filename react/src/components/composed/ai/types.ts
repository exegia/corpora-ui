import type * as React from "react"

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
