import type * as React from "react"

/** A single selected word in the reader. */
export interface IWordSelection {
  lemma: string
  partOfSpeech?: string
  pos?: string
  frequency?: number | string
  onViewDetails?: () => void
}

/** A selected run of reader nodes. */
export interface INodeSelection {
  range: string
  nodeIds: string[]
  wordCount: number
}

export interface ISelectionPopoverProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  variant: "word" | "node"
  word?: IWordSelection
  node?: INodeSelection
  onAddToChat?: () => void
  onClose?: () => void
  /** The selected reader content — rendered as the hover/focus trigger. */
  children?: React.ReactNode
  className?: string
}

export interface ISelectionHighlightProps
  extends React.ComponentPropsWithoutRef<"span"> {
  range?: string
}

export interface IAppliedMarkProps
  extends React.ComponentPropsWithoutRef<"span"> {
  nodeId?: string
}

export interface IApplyToastProps {
  open?: boolean
  message?: React.ReactNode
  onUndo?: () => void
  className?: string
}
