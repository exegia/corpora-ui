"use client"

import { useAtom } from "jotai"
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import type * as React from "react"
import { AtSign, ChevronDown, Mic, Paperclip, Plus, Slash } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover"
import type { IComposerProps, IComposerOption } from "../type"
import { composerAttachmentsAtom, removeComposerInstance } from "./utils"
import { SendButton } from "./send-button"
import { useDictation } from "./use-dictation"
import { Attachment } from "../attachment"
import { attachmentFileKind, attachmentMimeType } from "../attachment-file"

const AUTO_MODEL = [{ id: "auto", label: "Auto" }]
const control =
  "flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40"

/** Beautiful UI Prompt Bar layout, adapted for Corpora's composer contract.
 * https://www.beautifului.dev/#prompt-bar — see BEAUTIFUL-UI-LICENSE.txt. */
export function Composer({
  value,
  onValueChange,
  composerId,
  attachments: seedAttachments,
  isStreaming = false,
  disabled = false,
  safetyNote,
  expanded = false,
  placeholder = "Write a message…",
  SubmitButton = SendButton,
  ComposerMenu,
  Suggestions,
  defaultValue = "",
  onSubmit,
  onStop,
  className,
  shape = "rounded",
  sources = [],
  commands = [],
  models = AUTO_MODEL,
  model,
  defaultModel,
  onModelChange,
  onSourceSelect,
  onCommand,
  onFilesChange,
  accept,
  dictation = true,
}: IComposerProps): React.ReactElement {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [internalModel, setInternalModel] = useState(
    defaultModel ?? models[0]?.id ?? "auto"
  )
  const [promptsOpen, setPromptsOpen] = useState(true)
  const [plusOpen, setPlusOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [active, setActive] = useState(0)
  const [caret, setCaret] = useState(defaultValue.length)
  const [wide, setWide] = useState(expanded)
  const generatedId = useId()
  const id = composerId ?? generatedId
  const listId = `${generatedId}-options`
  const [attachments, setAttachments] = useAtom(composerAttachmentsAtom(id))
  const seeded = useRef(false)
  const input = useRef<HTMLTextAreaElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const surface = useRef<HTMLDivElement>(null)
  const controls = useRef<HTMLDivElement>(null)
  const measure = useRef<HTMLSpanElement>(null)
  const modelControl = useRef<HTMLDivElement>(null)
  const pendingCaret = useRef<number | null>(null)

  useEffect(() => {
    if (seeded.current) return
    seeded.current = true
    if (seedAttachments?.length) setAttachments(seedAttachments)
  }, [seedAttachments, setAttachments])
  useEffect(() => {
    if (composerId) return
    return () => removeComposerInstance(id)
  }, [composerId, id])
  const draft = value ?? internalValue
  const isDisabled = disabled || isStreaming
  const selectedModel = model ?? internalModel
  const changeValue = (next: string) => {
    if (value === undefined) setInternalValue(next)
    onValueChange?.(next)
  }
  const speech = useDictation((text) => {
    const next = draft ? `${draft.trimEnd()} ${text}` : text
    changeValue(next)
    setCaret(next.length)
  }, isDisabled || !dictation)

  const match = /(?:^|\s)([@/])([^\s@/]*)$/.exec(draft.slice(0, caret))
  const token = match
    ? {
        kind: match[1],
        query: match[2].toLowerCase(),
        start: caret - match[2].length - 1,
      }
    : null
  const kind = !isDisabled && !dismissed ? (plusOpen ? "@" : token?.kind) : null
  const options = (kind === "@" ? sources : commands).filter((item) =>
    item.label.toLowerCase().includes(plusOpen ? "" : (token?.query ?? ""))
  )
  const hasUpload =
    kind === "@" &&
    (plusOpen || !token?.query || "add photos and files".includes(token.query))
  const count = options.length + (hasUpload ? 1 : 0)
  const menuOpen = Boolean(kind)
  const closeMenu = () => {
    setPlusOpen(false)
    setDismissed(true)
  }
  const focusAt = (position: number) => {
    pendingCaret.current = position
    input.current?.focus()
  }
  const pick = (item: IComposerOption) => {
    if (isDisabled) return
    const replacement =
      item.insertText ?? `${kind === "@" ? "@" + item.label : "/" + item.id} `
    const start = !plusOpen && token ? token.start : caret
    const next = draft.slice(0, start) + replacement + draft.slice(caret)
    changeValue(next)
    setCaret(start + replacement.length)
    closeMenu()
    item.onSelect?.()
    if (kind === "@") onSourceSelect?.(item)
    else onCommand?.(item)
    focusAt(start + replacement.length)
  }
  const upload = () => {
    closeMenu()
    fileInput.current?.click()
  }
  const chooseActive = () => {
    const selected = Math.min(active, count - 1)
    if (hasUpload && selected === 0) upload()
    else {
      const item = options[selected - (hasUpload ? 1 : 0)]
      if (item) pick(item)
    }
  }
  const send = () => {
    if (isDisabled || (!draft.trim() && !attachments.length)) return
    speech.cancel()
    onSubmit?.(draft.trim(), "answer", attachments)
    if (value === undefined) setInternalValue("")
    setAttachments([])
    closeMenu()
  }
  useLayoutEffect(() => {
    if (pendingCaret.current === null || !input.current) return
    input.current.setSelectionRange(pendingCaret.current, pendingCaret.current)
    pendingCaret.current = null
  }, [draft])
  useLayoutEffect(() => {
    const field = input.current
    const row = controls.current
    if (!field || !row) return
    const resize = () => {
      const fixed =
        28 * (dictation ? 3 : 2) + (modelControl.current?.offsetWidth ?? 0) + 16
      const available = row.clientWidth - fixed
      setWide(
        expanded ||
          draft.includes("\n") ||
          (row.clientWidth > 0 &&
            (available < 110 ||
              (measure.current?.offsetWidth ?? 0) + 8 > available))
      )
      field.style.height = "0px"
      const height = Math.max(wide ? 44 : 28, field.scrollHeight)
      field.style.height = `${Math.min(height, 128)}px`
      field.style.overflowY = height > 128 ? "auto" : "hidden"
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(row)
    return () => observer.disconnect()
  }, [draft, expanded, wide, selectedModel, dictation])

  return (
    <form
      className="min-w-0 max-w-3xl w-full"
      data-slot="composer"
      data-expanded={wide ? "" : undefined}
      onSubmit={(event) => {
        event.preventDefault()
        send()
      }}
    >
      {Suggestions && (
        <Suggestions onOpenChange={setPromptsOpen} open={promptsOpen} />
      )}
      <Popover
        open={menuOpen}
        onOpenChange={(open) => {
          if (!open) closeMenu()
        }}
      >
        <div
          ref={surface}
          className={cn(
            "min-w-0 gap-1.5 p-1.5 shadow-sm relative flex flex-col border border-foreground/10 bg-(--chat-field) transition-[border-color,border-radius] duration-150 focus-within:border-foreground/25",
            shape === "pill"
              ? wide || attachments.length
                ? "rounded-3xl"
                : "rounded-full"
              : "rounded-[14px]",
            className
          )}
        >
          <span
            ref={measure}
            aria-hidden
            className="pointer-events-none invisible absolute text-[13px] leading-[18px] whitespace-pre"
          >
            {draft}
          </span>
          {attachments.length > 0 && (
            <div
              className="gap-1.5 px-0.5 pt-0.5 flex flex-wrap"
              data-slot="composer-tray"
            >
              {attachments.map((attachment) => (
                <Attachment
                  key={attachment.id}
                  {...attachment}
                  onRemove={
                    isDisabled
                      ? undefined
                      : () =>
                          setAttachments((items) =>
                            items.filter((item) => item.id !== attachment.id)
                          )
                  }
                />
              ))}
            </div>
          )}
          <div
            ref={controls}
            className={cn(
              "min-w-0 gap-x-1 gap-y-1.5 grid items-end",
              dictation
                ? wide
                  ? "grid-cols-[28px_auto_minmax(0,1fr)_28px_28px]"
                  : "grid-cols-[28px_minmax(0,1fr)_auto_28px_28px]"
                : wide
                  ? "grid-cols-[28px_auto_minmax(0,1fr)_28px]"
                  : "grid-cols-[28px_minmax(0,1fr)_auto_28px]"
            )}
          >
            <div
              className={
                wide ? "col-start-1 row-start-2" : "col-start-1 row-start-1"
              }
            >
              {ComposerMenu ? (
                <ComposerMenu disabled={isDisabled} />
              ) : (
                <PopoverTrigger
                  render={<button type="button" />}
                  aria-label="Add attachments and sources"
                  data-cuelume-press=""
                  data-cuelume-release=""
                  disabled={isDisabled}
                  className={control}
                  onClick={() => {
                    setPlusOpen(!plusOpen)
                    setDismissed(false)
                    setActive(0)
                    input.current?.focus()
                  }}
                >
                  <Plus aria-hidden className="size-4" />
                </PopoverTrigger>
              )}
            </div>
            <textarea
              ref={input}
              rows={1}
              aria-label="Message"
              aria-keyshortcuts="Meta+Enter Control+Enter"
              aria-controls={menuOpen ? listId : undefined}
              aria-activedescendant={
                menuOpen && count
                  ? `${listId}-${Math.min(active, count - 1)}`
                  : undefined
              }
              autoComplete="off"
              disabled={isDisabled}
              value={draft}
              placeholder={speech.listening ? "Listening…" : placeholder}
              className={cn(
                "min-h-7 min-w-0 px-1 w-full resize-none bg-transparent py-[5px] text-[13px] leading-[18px] [overflow-wrap:anywhere] text-foreground outline-none placeholder:text-muted-foreground/70 disabled:opacity-50",
                wide
                  ? "col-span-full col-start-1 row-start-1"
                  : "col-start-2 row-start-1"
              )}
              onFocus={() => setPromptsOpen(false)}
              onSelect={(event) => setCaret(event.currentTarget.selectionStart)}
              onChange={(event) => {
                changeValue(event.target.value)
                setCaret(event.target.selectionStart)
                setDismissed(false)
                setPlusOpen(false)
                setActive(0)
              }}
              onKeyDown={(event) => {
                if (event.nativeEvent.isComposing) return
                if (event.key === "Escape") {
                  closeMenu()
                  if (isStreaming) onStop?.()
                  return
                }
                if (
                  menuOpen &&
                  count &&
                  (event.key === "ArrowDown" || event.key === "ArrowUp")
                ) {
                  event.preventDefault()
                  setActive(
                    (current) =>
                      (current + (event.key === "ArrowDown" ? 1 : count - 1)) %
                      count
                  )
                  return
                }
                if (
                  menuOpen &&
                  count &&
                  (event.key === "Tab" ||
                    (event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.metaKey &&
                      !event.ctrlKey))
                ) {
                  event.preventDefault()
                  chooseActive()
                  return
                }
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  send()
                }
              }}
            />
            <div
              ref={modelControl}
              className={
                wide
                  ? "min-w-0 col-start-2 row-start-2"
                  : "min-w-0 col-start-3 row-start-1"
              }
            >
              <Select
                value={selectedModel}
                onValueChange={(next) => {
                  if (next) {
                    if (model === undefined) setInternalModel(next)
                    onModelChange?.(next)
                  }
                }}
                disabled={isDisabled}
              >
                <SelectTrigger
                  aria-label="Choose model"
                  className="h-7 min-h-7 min-w-0 max-w-32 gap-1 px-1.5 text-xs font-medium sm:min-h-7 sm:text-xs w-auto rounded-lg border-0 bg-transparent! text-muted-foreground shadow-none! before:hidden hover:bg-foreground/5! [&_[data-slot=select-icon]]:hidden"
                >
                  <SelectValue>
                    {models.find((item) => item.id === selectedModel)?.label ??
                      "Auto"}
                  </SelectValue>
                  <ChevronDown aria-hidden className="size-3!" />
                </SelectTrigger>
                <SelectPopup
                  side="top"
                  alignItemWithTrigger={false}
                  className="min-w-44"
                >
                  {models.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.label}
                      {item.description && (
                        <span className="text-xs ml-auto text-muted-foreground">
                          {" "}
                          {item.description}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </div>
            {dictation && (
              <button
                type="button"
                aria-label={
                  speech.listening ? "Stop dictation" : "Start dictation"
                }
                aria-pressed={speech.listening}
                data-cuelume-press=""
                data-cuelume-release=""
                title={
                  speech.supported
                    ? "Dictate a message"
                    : "Dictation is not supported in this browser"
                }
                disabled={isDisabled || !speech.supported}
                onClick={speech.toggle}
                className={cn(
                  control,
                  wide ? "col-start-4 row-start-2" : "col-start-4 row-start-1",
                  speech.listening && "bg-primary/10 text-primary"
                )}
              >
                <Mic
                  aria-hidden
                  className={cn(
                    "size-4",
                    speech.listening &&
                      "animate-pulse motion-reduce:animate-none"
                  )}
                />
              </button>
            )}
            <div
              className={cn(
                dictation ? "col-start-5" : "col-start-4",
                wide ? "row-start-2" : "row-start-1"
              )}
            >
              <SubmitButton
                isExpanded
                isStreaming={isStreaming}
                disabled={
                  !isStreaming &&
                  (disabled || (!draft.trim() && !attachments.length))
                }
                onStop={onStop}
              />
            </div>
          </div>
        </div>
        <PopoverPopup
          anchor={surface}
          side="top"
          align="start"
          sideOffset={8}
          initialFocus={false}
          finalFocus={false}
          className="min-w-56 [&_[data-slot=popover-viewport]]:p-1 w-(--anchor-width) rounded-[10px]"
        >
          <div
            id={listId}
            role="listbox"
            aria-label={kind === "@" ? "Sources and attachments" : "Commands"}
          >
            {hasUpload && (
              <button
                id={`${listId}-0`}
                type="button"
                role="option"
                aria-selected={active === 0}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActive(0)}
                onClick={upload}
                className={cn(
                  "min-h-9 gap-2 px-2 flex w-full items-center rounded-md text-left text-[13px]",
                  active === 0 && "bg-foreground/5"
                )}
              >
                <Paperclip aria-hidden className="size-4" />
                <span>Add photos &amp; files</span>
              </button>
            )}
            {options.map((item, index) => {
              const row = index + (hasUpload ? 1 : 0)
              return (
                <button
                  id={`${listId}-${row}`}
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={active === row}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActive(row)}
                  onClick={() => pick(item)}
                  className={cn(
                    "min-h-9 gap-2 px-2 flex w-full items-center rounded-md text-left text-[13px]",
                    active === row && "bg-foreground/5"
                  )}
                >
                  <span className="[&_svg]:size-4 shrink-0">
                    {item.icon ??
                      (kind === "@" ? (
                        <AtSign aria-hidden className="size-4" />
                      ) : (
                        <Slash aria-hidden className="size-4" />
                      ))}
                  </span>
                  <span className="shrink-0">{item.label}</span>
                  <span className="text-xs truncate text-muted-foreground">
                    {item.description}
                  </span>
                </button>
              )
            })}
            {!count && (
              <p className="px-2 py-3 text-xs text-muted-foreground">
                No {kind === "@" ? "sources" : "commands"} found.
              </p>
            )}
          </div>
          <p className="mt-1 px-2 py-1.5 border-t text-[11px] text-muted-foreground">
            {kind === "@"
              ? "Type @ to search sources & files"
              : "Type / to search commands"}
          </p>
        </PopoverPopup>
      </Popover>
      <input
        ref={fileInput}
        type="file"
        multiple
        accept={accept}
        aria-label="Attach files"
        className="hidden"
        disabled={isDisabled}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          if (!files.length) return
          setAttachments((items) => [
            ...items,
            ...files.map((file) => ({
              id: crypto.randomUUID(),
              ...attachmentFileKind(file),
              title: file.name,
              meta: attachmentMimeType(file),
              file,
            })),
          ])
          onFilesChange?.(files)
          event.target.value = ""
          input.current?.focus()
        }}
      />
      {speech.error && (
        <p role="status" className="mt-1 text-xs text-muted-foreground">
          {speech.error}
        </p>
      )}
      {safetyNote && (
        <p className="mt-1 px-1.5 text-[10px] text-muted-foreground">
          {safetyNote}
        </p>
      )}
    </form>
  )
}
