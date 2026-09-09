"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

export interface MessageSenderProps extends React.ComponentPropsWithoutRef<"div"> {
  /** An `<Attachment variant="preview" />`, rendered above the bubble. */
  attachment?: React.ReactNode
  children: React.ReactNode
}

/**
 * Outgoing message: attachment preview above a dark, right-aligned bubble.
 *
 * @sketch "Block / Message / Sender + Attachment"
 */
export function MessageSender({ attachment, children, className, ...props }: MessageSenderProps): React.ReactElement {
  return (
    <div data-slot="message" data-variant="sender" className={cn("flex w-full flex-col items-end gap-1.5", className)} {...props}>
      {attachment}
      <div className="max-w-[280px] rounded-[20px] bg-surface-bubble-sender px-3.5 py-2.5 text-[13px] leading-4 text-text-inverse">
        {children}
      </div>
    </div>
  )
}

export interface MessageRecipientProps extends React.ComponentPropsWithoutRef<"div"> {
  name?: React.ReactNode
  time?: React.ReactNode
  /** An `<Attachment variant="preview" />`, rendered inside the bubble under the text. */
  attachment?: React.ReactNode
  children: React.ReactNode
}

/**
 * Incoming message: name + time header, muted bubble with the attachment inside.
 *
 * @sketch "Block / Message / Recipient + Attachment"
 */
export function MessageRecipient({ name, time, attachment, children, className, ...props }: MessageRecipientProps): React.ReactElement {
  return (
    <div data-slot="message" data-variant="recipient" className={cn("flex w-full flex-col items-start gap-1.5", className)} {...props}>
      {name ? (
        <div className="flex items-baseline gap-1.5 px-3.5">
          <span className="text-[13px] font-semibold leading-4 text-text-primary">{name}</span>
          {time ? <span className="text-[11px] text-text-muted">{time}</span> : null}
        </div>
      ) : null}
      <div className="flex max-w-[300px] flex-col gap-2 rounded-[20px] bg-surface-bubble-recipient px-3.5 py-2.5 text-[13px] leading-4 text-text-primary">
        <div>{children}</div>
        {attachment}
      </div>
    </div>
  )
}
