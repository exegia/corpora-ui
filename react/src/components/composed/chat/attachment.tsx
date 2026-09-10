"use client"

import { AtSign, BookOpen, Download, Film, FileText, Image as ImageIcon, Link as LinkIcon, Reply, TextQuote } from "lucide-react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PreviewCard, PreviewCardPopup, PreviewCardTrigger } from "@/components/ui/preview-card"
import {
  AvatarHandle,
  DurationPill,
  Favicon,
  IconTile,
  PlayButton,
  QuoteRail,
  RemoveButton,
  Thumbnail,
  Waveform,
} from "@/components/ui/chat"

export type AttachmentKind =
  | "document"
  | "image"
  | "media"
  | "text-selection"
  | "chat-reply"
  | "username-handle"
  | "url-link"

export type AttachmentVariant = "default" | "preview"

interface AttachmentBase {
  id?: string
  className?: string
  style?: React.CSSProperties
  /** `default` is the 240×52 composer chip; `preview` the in-bubble rendering. */
  variant?: AttachmentVariant
  /** Primary line of the chip (file name, handle, URL, source…). */
  title: React.ReactNode
  /** Secondary line of the chip ("PDF · 2.4 MB", "Link · fetching preview"…). */
  meta?: React.ReactNode
  /** Fires from the chip's ✕. Omit (or pass `removable={false}`) to hide it. */
  onRemove?: () => void
  removable?: boolean
}

export type AttachmentProps = AttachmentBase &
  (
    | { kind: "document"; onAction?: () => void; actionIcon?: React.ReactNode }
    | { kind: "image"; src?: string; alt?: string }
    | { kind: "media"; src?: string; poster?: string; duration?: React.ReactNode; audio?: boolean; onPlay?: () => void; waveform?: number[] }
    | { kind: "text-selection"; quote?: React.ReactNode }
    | { kind: "chat-reply"; author?: React.ReactNode; time?: React.ReactNode; body?: React.ReactNode }
    | { kind: "username-handle"; src?: string; initials?: string }
    | { kind: "url-link"; src?: string; domain?: React.ReactNode; description?: React.ReactNode; favicon?: string; href?: string }
  )

const KIND_ICON: Record<AttachmentKind, React.ComponentType<{ className?: string }>> = {
  document: FileText,
  image: ImageIcon,
  media: Film,
  "text-selection": TextQuote,
  "chat-reply": Reply,
  "username-handle": AtSign,
  "url-link": LinkIcon,
}

const chipClasses = "flex h-[52px] w-60 items-center gap-2.5 rounded-[10px] border border-border-default bg-surface-card py-1.5 pl-1.5 pr-2.5 text-left"
const titleClasses = "truncate text-[13px] font-medium leading-[15px] text-text-primary"
const metaClasses = "truncate text-[11px] leading-3 text-text-secondary"

/**
 * One attachment in every shape the chat needs — a composer chip before
 * sending (`variant="default"`) or the rendering inside a bubble
 * (`variant="preview"`).
 *
 * @sketch "Component / Attachment / {Image, Media, Document, Text Selection, Chat Reply, Username Handle, URL Link} / {Default, Preview}", "Component / Attachment / Media / Preview Audio"
 */
export function Attachment(props: AttachmentProps): React.ReactElement {
  if (props.variant === "preview") return <AttachmentPreview {...props} />
  if (!PREVIEWABLE.has(props.kind)) return <AttachmentChip {...props} />
  // A chip whose kind has a richer rendering shows it on hover / focus.
  return (
    <PreviewCard>
      <PreviewCardTrigger delay={300} render={<AttachmentChip {...props} />} />
      <PreviewCardPopup className="w-fit p-1.5">
        <AttachmentPreview {...props} variant="preview" removable={false} />
      </PreviewCardPopup>
    </PreviewCard>
  )
}

/** Kinds whose preview rendering says more than the chip: images, media, quotes, replies and link cards. */
const PREVIEWABLE: ReadonlySet<AttachmentKind> = new Set(["image", "media", "text-selection", "chat-reply", "url-link"])

function AttachmentChip(props: AttachmentProps & Record<string, unknown>): React.ReactElement {
  const { kind, variant: _variant, title, meta, onRemove, removable = true, className, id, style, ...rest } = props
  const Icon = KIND_ICON[kind]
  const leading =
    kind === "image" ? (
      <Thumbnail src={props.src} alt={props.alt} />
    ) : (
      <IconTile>
        <Icon />
      </IconTile>
    )
  return (
    <div {...chipRest(rest)} data-slot="attachment" data-kind={kind} data-variant="default" className={cn(chipClasses, className)} id={id} style={style}>
      {leading}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={titleClasses}>{title}</span>
        {meta ? <span className={metaClasses}>{meta}</span> : null}
      </span>
      {removable && onRemove ? <RemoveButton onClick={onRemove} /> : null}
    </div>
  )
}

/** Only what the preview-card trigger merges in (ref, hover/focus handlers, aria); the kind-specific props stay off the DOM. */
const KIND_PROPS = new Set(["src", "alt", "poster", "duration", "audio", "onPlay", "waveform", "quote", "author", "time", "body", "initials", "domain", "description", "favicon", "href", "onAction", "actionIcon"])
function chipRest(rest: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(rest).filter(([k]) => !KIND_PROPS.has(k)))
}

function AttachmentPreview(props: AttachmentProps): React.ReactElement {
  const { kind, variant: _variant, title, meta, onRemove: _onRemove, removable: _removable, className, id, style } = props
  const shared = { "data-slot": "attachment", "data-kind": kind, "data-variant": "preview", id, style } as const

  switch (props.kind) {
    case "image":
      return (
        <Thumbnail size="lg" src={props.src} alt={props.alt} className={className} {...shared} />
      )
    case "media": {
      const { src, poster, duration, audio, onPlay, waveform } = props
      if (audio) {
        return (
          <div {...shared} className={cn("flex h-14 w-60 items-center gap-3 rounded-[10px] border border-border-default bg-surface-card py-2.5 pl-2.5 pr-3.5", className)}>
            <PlayButton onClick={onPlay} className="bg-text-primary text-text-inverse hover:bg-text-primary/85" />
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <Waveform bars={waveform} />
              <span className={metaClasses}>{meta ?? title}</span>
            </span>
          </div>
        )
      }
      return (
        <Thumbnail size="lg" src={poster ?? src} className={className} {...shared}>
          <PlayButton onClick={onPlay} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          {duration ? <DurationPill className="absolute bottom-2 right-2">{duration}</DurationPill> : null}
        </Thumbnail>
      )
    }
    case "document": {
      const { onAction, actionIcon } = props
      return (
        <div {...shared} className={cn("flex h-14 w-[260px] items-center gap-2.5 rounded-[10px] border border-border-default bg-surface-card py-2 pl-2 pr-3", className)}>
          <IconTile><FileText /></IconTile>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className={titleClasses}>{title}</span>
            {meta ? <span className={metaClasses}>{meta}</span> : null}
          </span>
          {onAction ? (
            <Button aria-label="Download" variant="ghost" size="icon-xs" onClick={onAction} className="size-6 text-icon sm:size-6">
              {actionIcon ?? <Download />}
            </Button>
          ) : null}
        </div>
      )
    }
    case "text-selection":
      return (
        <div {...shared} className={cn("flex w-[260px] gap-2.5 rounded-[10px] bg-surface-subtle p-2.5", className)}>
          <QuoteRail />
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold leading-4 text-accent-text [&_svg]:size-4 [&_svg]:text-accent-default">
              <BookOpen />
              <span className="truncate">{title}</span>
            </span>
            <span className="line-clamp-4 text-[13px] leading-[15px] text-text-primary">{props.quote}</span>
          </span>
        </div>
      )
    case "chat-reply":
      return (
        <div {...shared} className={cn("flex w-[260px] gap-2 rounded-[10px] bg-surface-subtle py-2 pl-2 pr-2.5", className)}>
          <QuoteRail />
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="flex items-center gap-1.5 text-[12px] leading-4 [&_svg]:size-4 [&_svg]:text-accent-default">
              <Reply />
              <span className="truncate font-semibold text-accent-text">{props.author ?? title}</span>
              {props.time ? <span className="text-[11px] text-text-muted">{props.time}</span> : null}
            </span>
            <span className="line-clamp-3 text-[13px] leading-[15px] text-text-primary">{props.body ?? meta}</span>
          </span>
        </div>
      )
    case "username-handle":
      return (
        <span {...shared} className={cn("inline-flex h-6 items-center gap-1.5 rounded-full bg-accent-subtle py-0.5 pl-0.5 pr-2 text-[13px] font-semibold leading-none text-accent-text", className)}>
          <AvatarHandle src={props.src} initials={props.initials} />
          {title}
        </span>
      )
    case "url-link": {
      const { src, domain, description, favicon, href } = props
      const Tag = href ? "a" : "div"
      return (
        <Tag
          {...shared}
          href={href}
          target={href ? "_blank" : undefined}
          rel={href ? "noreferrer" : undefined}
          className={cn("block w-60 overflow-hidden rounded-[10px] border border-border-default bg-surface-card", className)}
        >
          <Thumbnail size="lg" src={src} className="h-[120px] w-full rounded-none" />
          <span className="flex flex-col gap-1 px-3 pb-3 pt-2.5">
            <span className="flex items-center gap-1.5 font-mono text-[10.5px] leading-3 text-text-secondary">
              <Favicon src={favicon} />
              <span className="truncate">{domain}</span>
            </span>
            <span className={titleClasses}>{title}</span>
            {description ? <span className="line-clamp-2 text-[11px] leading-[14px] text-text-secondary">{description}</span> : null}
          </span>
        </Tag>
      )
    }
  }
}
