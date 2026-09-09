"use client"

import { useAtom } from "jotai"
import * as React from "react"
import { cn } from "@/lib/utils"
import { AddButton, SendButton } from "@/components/ui/chat"
import { Attachment } from "@/components/composed/chat"
import {
  type ComposerAttachment,
  composerAttachmentsAtom,
  removeComposerInstance,
} from "./composer-attachments-atom"

export interface ComposerWithAttachmentsProps extends Omit<React.ComponentPropsWithoutRef<"div">, "onSubmit"> {
  /** Stable id for the tray atoms. Unnamed composers key off `useId()` and drop their state on unmount. */
  composerId?: string
  /** Seed the tray on first mount (uncontrolled). */
  defaultAttachments?: ComposerAttachment[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  /** Called on Send or ⌘/Ctrl+↵ with the draft and the current tray. */
  onSend?: (draft: string, attachments: ComposerAttachment[]) => void
  onAdd?: () => void
  hint?: React.ReactNode
  sendLabel?: React.ReactNode
  disabled?: boolean
}

/**
 * Composer card with a chip tray above the draft.
 *
 * @sketch "Block / Composer / With Attachments"
 */
export function ComposerWithAttachments({
  composerId,
  defaultAttachments,
  value,
  defaultValue = "",
  onValueChange,
  placeholder = "Ask about this selection…",
  onSend,
  onAdd,
  hint = "Press ⌘ + ↵ to send message",
  sendLabel = "Send",
  disabled = false,
  className,
  ...props
}: ComposerWithAttachmentsProps): React.ReactElement {
  const generatedId = React.useId()
  const id = composerId ?? generatedId
  const [attachments, setAttachments] = useAtom(composerAttachmentsAtom(id))
  const [internal, setInternal] = React.useState(defaultValue)
  const draft = value ?? internal

  // Seed once, then let the atoms own the tray.
  const seeded = React.useRef(false)
  React.useLayoutEffect(() => {
    if (seeded.current) return
    seeded.current = true
    if (defaultAttachments?.length) setAttachments(defaultAttachments)
  }, [defaultAttachments, setAttachments])

  React.useEffect(() => {
    if (composerId) return
    return () => removeComposerInstance(id)
  }, [composerId, id])

  const setDraft = (next: string) => {
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }
  const send = () => {
    if (disabled) return
    onSend?.(draft, attachments)
  }
  const remove = (itemId: string) => setAttachments(attachments.filter((a) => a.id !== itemId))

  return (
    <div
      data-slot="composer"
      className={cn("flex w-[520px] max-w-full flex-col gap-2.5 rounded-xl border border-border-default bg-surface-card p-3", className)}
      {...props}
    >
      {attachments.length > 0 ? (
        <div data-slot="composer-tray" className="flex flex-wrap gap-2">
          {attachments.map(({ id: itemId, ...item }) => (
            <Attachment key={itemId} {...(item as Omit<ComposerAttachment, "id">)} onRemove={() => remove(itemId)} />
          ))}
        </div>
      ) : null}
      <textarea
        aria-label="Message"
        className="min-h-4 w-full resize-none bg-transparent text-[13px] leading-4 text-text-primary outline-none placeholder:text-text-muted"
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            send()
          }
        }}
        placeholder={placeholder}
        rows={1}
        value={draft}
      />
      <div className="flex items-center justify-between gap-2">
        <AddButton onClick={onAdd} disabled={disabled} />
        <span className="flex items-center gap-2.5">
          <span className="text-[11px] text-text-muted">{hint}</span>
          <SendButton onClick={send} disabled={disabled}>{sendLabel}</SendButton>
        </span>
      </div>
    </div>
  )
}
