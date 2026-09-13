import type * as React from "react"

import type { MenuCommandItem } from "@/components/ui/menu-command"
import type { AttachmentProps } from "./attachment"
import type { HTMLMotionProps } from "motion/react"

export type ComposerMode = "answer" | "fix" | "ask"

/** A tray chip: any Attachment kind plus a stable id. */
export type ComposerAttachment = Omit<
  AttachmentProps,
  "variant" | "onRemove" | "removable"
> & { id: string }

export interface IComposerMenuProps {
  items?: MenuCommandItem[]
  onCommand?: (item: MenuCommandItem) => void
  onAttach?: () => void
}

export interface ComposerSuggestionsProps {
  prompts?: React.ReactNode
  label?: (count: number) => React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export interface IComposerSubmitButtonProps<
  S extends boolean = boolean,
  E extends boolean = boolean,
> {
  onStop?: () => void
  disabled?: boolean
  isStreaming: S
  isExpanded: E
}

export interface ComposerModeProps {
  mode: ComposerMode
  onModeChange?: (mode: ComposerMode) => void
}

export interface ComposerBaseProps<
  S extends boolean = boolean,
  E extends boolean = boolean,
  M extends ComposerMode = ComposerMode,
  A extends ComposerAttachment = ComposerAttachment,
> {
  value?: string
  onValueChange?: (value: string) => void
  composerId?: string
  /** Seeds the tray once on mount; the atoms own it from then on. */
  attachments?: A[]
  /** Start in the tall, focused layout. */
  expanded?: E
  isStreaming?: S
  disabled?: boolean
  safetyNote?: React.ReactNode
  placeholder?: string
  onSubmit?: (value: string, mode: M, attachments: A[]) => void
  /** Fires from the streaming Stop button and the Escape key. */
  onStop?: () => void
  className?: string
  defaultValue?: string
}

export interface IComposerProps<
  IMode extends ComposerModeProps = ComposerModeProps,
  S extends boolean = boolean,
  E extends boolean = boolean,
> extends ComposerBaseProps<S, E> {
  /** Replaces the default `SendButton`. Receives the streaming/expanded state. */
  SubmitButton?: React.FC<IComposerSubmitButtonProps<S, E>>
  ModeComponent?: React.FC<IMode>
  Suggestions?: React.FC<ComposerSuggestionsProps>
  ComposerMenu?: React.FC<IComposerMenuProps>
}

export interface SuggestedPromptsProps extends Omit<
  HTMLMotionProps<"div">,
  "children"
> {
  /** The `SuggestedPrompt` rows. */
  children: React.ReactNode
  /** Overrides the count derived from `children`. */
  count?: number
  /** Names the disclosure. `Suggestions (n)` by default. */
  label?: (count: number) => React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}
