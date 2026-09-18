"use client"

import {
  AtSign,
  BookOpen,
  Download,
  Film,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Reply,
  TextQuote,
} from "lucide-react"
import { useState, type ReactElement, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { ATTACHMENT_CONTENT } from "@/lib/attachment-content"
import { Button } from "@/components/ui/button"
import {
  PreviewCard,
  PreviewCardPopup,
  PreviewCardTrigger,
} from "@/components/ui/preview-card"
import {
  AvatarHandle,
  DurationPill,
  Favicon,
  PlayButton,
  QuoteRail,
  RemoveButton,
  Waveform,
} from "@/components/ui/chat"
import {
  attachmentFileKind,
  attachmentMimeType,
  useAttachmentFile,
} from "./attachment-file"

export type TAttachmentKind =
  | "document"
  | "image"
  | "media"
  | "text-selection"
  | "chat-reply"
  | "username-handle"
  | "url-link"
export type TAttachmentVariant = "default" | "preview"

interface IAttachmentBase {
  id?: string
  className?: string
  style?: React.CSSProperties
  /** `default` is the composer chip; `preview` is the sent attachment. */
  variant?: TAttachmentVariant
  title: ReactNode
  meta?: ReactNode
  onRemove?: () => void
  removable?: boolean
  /** A local file, retained through sending. Its type and preview are resolved automatically. */
  file?: File
  /** Content URL for an uploaded file, image, media or document. */
  src?: string
  /** A supplied thumbnail takes precedence over a generated image/video frame. */
  thumbnail?: string
  /** Custom rich hover content, for formats the browser cannot display itself. */
  preview?: ReactNode
  /** A document excerpt; text files generate one automatically (first 8 KB). */
  previewText?: string
  mimeType?: string
}

export type TAttachmentProps = IAttachmentBase &
  (
    | { kind: "document"; onAction?: () => void; actionIcon?: ReactNode }
    | { kind: "image"; alt?: string }
    | {
        kind: "media"
        poster?: string
        duration?: ReactNode
        audio?: boolean
        onPlay?: () => void
        waveform?: number[]
      }
    | { kind: "text-selection"; quote?: ReactNode }
    | {
        kind: "chat-reply"
        author?: ReactNode
        time?: ReactNode
        body?: ReactNode
      }
    | { kind: "username-handle"; initials?: string }
    | {
        kind: "url-link"
        domain?: ReactNode
        description?: ReactNode
        favicon?: string
        href?: string
      }
  )

const KIND_ICON = {
  document: FileText,
  image: ImageIcon,
  media: Film,
  "text-selection": TextQuote,
  "chat-reply": Reply,
  "username-handle": AtSign,
  "url-link": LinkIcon,
}
const chipClasses =
  "flex min-h-[52px] w-60 max-w-full items-center gap-2.5 rounded-lg border border-border-default bg-surface-card py-1.5 pl-1.5 pr-2.5 text-left"
const titleClasses =
  "truncate text-[13px] font-medium leading-[15px] text-text-primary"
const metaClasses = "truncate text-[11px] leading-3 text-text-secondary"
const panelClasses =
  "w-[260px] max-w-full overflow-hidden rounded-lg border border-border-default bg-surface-card"

/** Every attachment has a hover/focus preview, including documents and sent attachments. */
export function Attachment(props: TAttachmentProps): ReactElement {
  const filePreview = useAttachmentFile(props.file)
  const resolved = {
    ...props,
    ...(props.file ? attachmentFileKind(props.file) : {}),
    src: props.src ?? filePreview?.url,
    previewText: props.previewText ?? filePreview?.text,
    mimeType:
      props.mimeType ??
      (props.file ? attachmentMimeType(props.file) : undefined),
  } as TAttachmentProps
  return (
    <PreviewCard>
      <PreviewCardTrigger
        delay={300}
        tabIndex={0}
        render={
          <div className="w-fit max-w-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        }
      >
        {props.variant === "preview" ? (
          <AttachmentPreview {...resolved} />
        ) : (
          <AttachmentChip {...resolved} />
        )}
      </PreviewCardTrigger>
      <PreviewCardPopup
        className="p-1.5 w-fit max-w-[calc(100vw-2rem)] rounded-lg"
        data-slot="attachment-hover-preview"
      >
        {props.preview ?? (
          <AttachmentHover {...resolved} id={undefined} className={undefined} />
        )}
      </PreviewCardPopup>
    </PreviewCard>
  )
}

Object.assign(Attachment, { [ATTACHMENT_CONTENT]: true })

/** Real file content when available; a kind icon otherwise. No fabricated thumbnail. */
function AttachmentVisual({
  attachment,
  small = false,
  className,
}: {
  attachment: TAttachmentProps
  small?: boolean
  className?: string
}): ReactElement {
  const [failedSource, setFailedSource] = useState<string>()
  const Icon = KIND_ICON[attachment.kind]
  const label =
    typeof attachment.title === "string" ? attachment.title : "Attachment"
  const image =
    attachment.thumbnail ??
    (attachment.kind === "image" || attachment.kind === "url-link"
      ? attachment.src
      : attachment.kind === "media"
        ? attachment.poster
        : undefined)
  const video =
    attachment.kind === "media" && !attachment.audio
      ? attachment.src
      : undefined
  const pdf =
    attachment.kind === "document" &&
    (attachment.mimeType === "application/pdf" ||
      /\.pdf(?:[?#]|$)/i.test(attachment.src ?? ""))
  return (
    <div
      data-slot="attachment-thumbnail"
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-subtle text-text-muted",
        small ? "size-10" : "w-60 aspect-[3/2] max-w-full",
        className
      )}
    >
      {image && failedSource !== image ? (
        <img
          src={image}
          alt={attachment.kind === "image" ? (attachment.alt ?? label) : label}
          onError={() => setFailedSource(image)}
          className="size-full object-cover"
        />
      ) : video && failedSource !== video ? (
        <video
          src={video.includes("#") ? video : `${video}#t=0.1`}
          aria-label={label}
          preload="metadata"
          muted
          playsInline
          onError={() => setFailedSource(video)}
          className="size-full object-cover"
        />
      ) : !small && pdf && attachment.src ? (
        <object
          data={`${attachment.src.split("#")[0]}#page=1&view=FitH&toolbar=0&navpanes=0`}
          type="application/pdf"
          aria-label={`Preview of ${label}`}
          className="bg-white size-full"
        >
          <span className="p-4 text-sm text-neutral-600">
            PDF preview unavailable in this browser.
          </span>
        </object>
      ) : attachment.previewText ? (
        <pre
          aria-label={`${label} excerpt`}
          className={cn(
            "font-mono size-full overflow-hidden bg-background text-left break-words whitespace-pre-wrap text-foreground",
            small ? "p-1 text-[3px] leading-[4px]" : "p-3 leading-4 text-[11px]"
          )}
        >
          {attachment.previewText}
        </pre>
      ) : (
        <Icon aria-hidden className={small ? "size-4" : "size-9 opacity-60"} />
      )}
    </div>
  )
}

function AttachmentChip(props: TAttachmentProps): ReactElement {
  return (
    <div
      data-slot="attachment"
      data-kind={props.kind}
      data-variant="default"
      className={cn(chipClasses, props.className)}
      id={props.id}
      style={props.style}
    >
      <AttachmentVisual attachment={props} small />
      <span className="min-w-0 gap-0.5 flex flex-1 flex-col">
        <span className={titleClasses}>{props.title}</span>
        {props.meta ? <span className={metaClasses}>{props.meta}</span> : null}
      </span>
      {props.removable !== false && props.onRemove ? (
        <RemoveButton onClick={props.onRemove} />
      ) : null}
    </div>
  )
}

function AttachmentPreview(props: TAttachmentProps): ReactElement {
  const { kind, title, meta, className, id, style } = props
  const shared = {
    "data-slot": "attachment",
    "data-kind": kind,
    "data-variant": "preview",
    id,
    style,
  } as const
  switch (props.kind) {
    case "image":
      return (
        <div {...shared} className={cn("max-w-full rounded-lg", className)}>
          <AttachmentVisual attachment={props} />
        </div>
      )
    case "media": {
      if (props.audio) {
        return (
          <div
            {...shared}
            className={cn(panelClasses, "gap-2 p-2.5 flex flex-col", className)}
          >
            <span className={titleClasses}>{title}</span>
            {props.src ? (
              <audio
                controls
                preload="metadata"
                src={props.src}
                aria-label={
                  typeof title === "string" ? title : "Audio attachment"
                }
                className="h-9 min-w-0 w-full"
              />
            ) : (
              <div className="gap-3 flex items-center">
                <PlayButton onClick={props.onPlay} />
                <Waveform bars={props.waveform} />
              </div>
            )}
            {meta ? <span className={metaClasses}>{meta}</span> : null}
          </div>
        )
      }
      return (
        <div
          {...shared}
          className={cn(
            "w-60 relative max-w-full overflow-hidden rounded-lg",
            className
          )}
        >
          {props.src ? (
            <video
              controls
              preload="metadata"
              playsInline
              src={props.src}
              poster={props.poster ?? props.thumbnail}
              aria-label={
                typeof title === "string" ? title : "Video attachment"
              }
              className="aspect-[3/2] w-full rounded-lg bg-surface-subtle object-cover"
            />
          ) : (
            <>
              <AttachmentVisual attachment={props} />
              <PlayButton
                onClick={props.onPlay}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              />
            </>
          )}
          {props.duration ? (
            <DurationPill className="right-2 top-2 pointer-events-none absolute">
              {props.duration}
            </DurationPill>
          ) : null}
        </div>
      )
    }
    case "document":
      return (
        <div {...shared} className={cn(chipClasses, "w-[260px]", className)}>
          <AttachmentVisual attachment={props} small />
          <span className="min-w-0 gap-0.5 flex flex-1 flex-col">
            <span className={titleClasses}>{title}</span>
            {meta ? <span className={metaClasses}>{meta}</span> : null}
          </span>
          {props.onAction ? (
            <Button
              aria-label="Download"
              variant="ghost"
              size="icon-xs"
              onClick={props.onAction}
            >
              {props.actionIcon ?? <Download />}
            </Button>
          ) : null}
        </div>
      )
    case "text-selection":
      return (
        <div
          {...shared}
          className={cn(
            "gap-2.5 p-2.5 flex w-[260px] max-w-full rounded-lg bg-surface-subtle",
            className
          )}
        >
          <QuoteRail />
          <span className="min-w-0 gap-1 flex flex-1 flex-col">
            <span className="gap-1.5 font-semibold leading-4 flex items-center text-[11px] text-accent-text">
              <BookOpen className="size-4 shrink-0" />
              <span className="truncate">{title}</span>
            </span>
            <span className="line-clamp-4 text-[13px] leading-[15px] text-text-primary">
              {props.quote ?? meta}
            </span>
          </span>
        </div>
      )
    case "chat-reply":
      return (
        <div
          {...shared}
          className={cn(
            "gap-2 p-2.5 flex w-[260px] max-w-full rounded-lg bg-surface-subtle",
            className
          )}
        >
          <QuoteRail />
          <span className="min-w-0 gap-0.5 flex flex-1 flex-col">
            <span className="gap-1.5 leading-4 flex items-center text-[12px] text-accent-text">
              <Reply className="size-4 shrink-0" />
              <span className="font-semibold truncate">
                {props.author ?? title}
              </span>
              {props.time ? (
                <span className="text-[11px] text-text-muted">
                  {props.time}
                </span>
              ) : null}
            </span>
            <span className="line-clamp-3 text-[13px] leading-[15px] text-text-primary">
              {props.body ?? meta}
            </span>
          </span>
        </div>
      )
    case "username-handle":
      return (
        <span
          {...shared}
          className={cn(
            "h-6 gap-1.5 py-0.5 pl-0.5 pr-2 font-semibold inline-flex max-w-full items-center rounded-lg bg-accent-subtle text-[13px] leading-none text-accent-text",
            className
          )}
        >
          <AvatarHandle src={props.src} initials={props.initials} />
          {title}
        </span>
      )
    case "url-link": {
      const Tag = props.href ? "a" : "div"
      return (
        <Tag
          {...shared}
          href={props.href}
          target={props.href ? "_blank" : undefined}
          rel={props.href ? "noreferrer" : undefined}
          className={cn(panelClasses, "w-60 block", className)}
        >
          <AttachmentVisual
            attachment={props}
            className="h-[120px] w-full rounded-none"
          />
          <span className="gap-1 px-3 pb-3 pt-2.5 flex flex-col">
            <span className="gap-1.5 font-mono leading-3 flex items-center text-[10.5px] text-text-secondary">
              <Favicon src={props.favicon} />
              <span className="truncate">{props.domain}</span>
            </span>
            <span className={titleClasses}>{title}</span>
            {props.description ? (
              <span className="line-clamp-2 text-[11px] leading-[14px] text-text-secondary">
                {props.description}
              </span>
            ) : null}
          </span>
        </Tag>
      )
    }
  }
}

function AttachmentHover(props: TAttachmentProps): ReactElement {
  if (props.kind === "document") {
    return (
      <div className={cn(panelClasses, "border-0")}>
        <AttachmentVisual
          attachment={props}
          className="w-full rounded-b-none"
        />
        <div className="gap-1 p-3 flex flex-col">
          <span className={titleClasses}>{props.title}</span>
          {props.meta ? (
            <span className={metaClasses}>{props.meta}</span>
          ) : null}
        </div>
      </div>
    )
  }
  if (props.kind === "username-handle") {
    return (
      <div className="w-60 gap-3 p-3 flex max-w-full items-center rounded-lg bg-surface-card">
        <AvatarHandle src={props.src} initials={props.initials} size={20} />
        <span className="min-w-0 gap-1 flex flex-col">
          <span className={titleClasses}>{props.title}</span>
          {props.meta ? (
            <span className={metaClasses}>{props.meta}</span>
          ) : null}
        </span>
      </div>
    )
  }
  return (
    <div className="gap-2 flex max-w-full flex-col">
      <AttachmentPreview {...props} variant="preview" removable={false} />
      {props.kind === "image" || props.kind === "media" ? (
        <div className="max-w-60 gap-1 px-1 pb-1 flex flex-col">
          <span className={titleClasses}>{props.title}</span>
          {props.meta ? (
            <span className={metaClasses}>{props.meta}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
