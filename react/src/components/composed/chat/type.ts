import type * as React from "react"

import type { IMenuCommandItem } from "@/components/ui/menu-command"
import type { TAttachmentProps } from "./attachment"
import type { HTMLMotionProps } from "motion/react"
import type { TAtomSize } from "@/components/atoms/types"

export type TComposerMode = "answer" | "fix" | "ask"

/** A tray chip: any Attachment kind plus a stable id. */
export type TComposerAttachment = Omit<
  TAttachmentProps,
  "variant" | "onRemove" | "removable"
> & { id: string }

export interface IComposerMenuProps {
  items?: IMenuCommandItem[]
  onCommand?: (item: IMenuCommandItem) => void
  onAttach?: () => void
}

export interface IComposerSuggestionsProps {
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

export interface IComposerModeProps {
  mode: TComposerMode
  onModeChange?: (mode: TComposerMode) => void
}

export interface IComposerBaseProps<
  S extends boolean = boolean,
  E extends boolean = boolean,
  M extends TComposerMode = TComposerMode,
  A extends TComposerAttachment = TComposerAttachment,
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
  IMode extends IComposerModeProps = IComposerModeProps,
  S extends boolean = boolean,
  E extends boolean = boolean,
> extends IComposerBaseProps<S, E> {
  /** Replaces the default `SendButton`. Receives the streaming/expanded state. */
  SubmitButton?: React.FC<IComposerSubmitButtonProps<S, E>>
  ModeComponent?: React.FC<IMode>
  Suggestions?: React.FC<IComposerSuggestionsProps>
  ComposerMenu?: React.FC<IComposerMenuProps>
}

export interface ISuggestedPromptsProps extends Omit<
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

export type TBubbleActionPayload =
  string | number | Record<string, unknown> | undefined
export type TBubbleActionSize = Extract<TAtomSize, "sm" | "default" | "lg">
export type TBubbleActionKey =
  "copy" | "edit" | "delete" | "share" | "retry" | "more" | "download"
export interface IBubbleActionBaseProps<
  S extends TBubbleActionSize = TBubbleActionSize,
  K extends TBubbleActionKey = TBubbleActionKey,
  P extends TBubbleActionPayload = TBubbleActionPayload,
> {
  key: K
  onClick?: (key: K, payload: P) => void
  icon?: React.ReactNode
  tooltip?: string
  size?: S
}

export type TIBubbleActionProps<
  K extends TBubbleActionKey = TBubbleActionKey,
  S extends TBubbleActionSize = TBubbleActionSize,
  P extends TBubbleActionPayload = TBubbleActionPayload,
> = IBubbleActionBaseProps<S, K, P>
export interface IBubbleActionsProps<
  K extends TBubbleActionKey = TBubbleActionKey,
  S extends TBubbleActionSize = TBubbleActionSize,
  P extends TBubbleActionPayload = TBubbleActionPayload,
> {
  size?: S
  onClick?: (key: K, payload: P) => void
  actions: { [key in K]?: TIBubbleActionProps<K, S, P> }
}
