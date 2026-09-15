import type * as React from "react"

/** A single selected word in the reader. */
export interface WordSelection {
  lemma: string
  partOfSpeech?: string
  pos?: string
  frequency?: number | string
  onViewDetails?: () => void
}

/** A selected run of reader nodes. */
export interface NodeSelection {
  range: string
  nodeIds: string[]
  wordCount: number
}

export interface SelectionPopoverProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  variant: "word" | "node"
  word?: WordSelection
  node?: NodeSelection
  onAddToChat?: () => void
  onClose?: () => void
  /** The selected reader content — rendered as the hover/focus trigger. */
  children?: React.ReactNode
  className?: string
}

export interface SelectionHighlightProps
  extends React.ComponentPropsWithoutRef<"span"> {
  range?: string
}

export interface AppliedMarkProps
  extends React.ComponentPropsWithoutRef<"span"> {
  nodeId?: string
}

export interface ApplyToastProps {
  open?: boolean
  message?: React.ReactNode
  onUndo?: () => void
  className?: string
}
