"use client"

import { motion, useReducedMotion } from "motion/react"
import { useAtom } from "jotai"
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { BOUNCE_IN_OUT, EASE_OUT, SPRING_PANEL } from "@/lib/ease"
import { Textarea } from "@/components/ui/textarea"
import { Text } from "@/components/atoms"
import { Attachment } from "../attachment"
import { SendHint } from "@/components/composed/ai/shared"
import type {
  ComposerMode,
  IComposerProps,
  IComposerSubmitButtonProps,
} from "./type"
import { composerAttachmentsAtom, removeComposerInstance } from "./utils"
import { SendButton } from "./send-button"

/**
 * Prompt field with two shapes: a pill at rest showing the "⌘ + ↵" hint,
 * that squares off into a taller field on focus with the attach and Send
 * controls springing in along its bottom edge.
 */
export function Composer({
  value,
  onValueChange,
  composerId,
  attachments: seedAttachments,
  isStreaming = false,
  disabled = false,
  safetyNote,
  expanded = false,
  placeholder = "Ask about this selection…",
  SubmitButton,
  ComposerMenu,
  Suggestions,
  defaultValue = "",
  onSubmit,
  className,
}: IComposerProps): React.ReactElement {
  const reduceMotion = useReducedMotion()
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [isFocused, setIsExpanded] = useState(expanded)
  const [mode] = useState<ComposerMode>("answer")
  // The prompts fold when the field expands: the two never stack open.
  const [promptsOpen, setPromptsOpen] = useState(true)

  const expand = (): void => {
    setIsExpanded(true)
    if (promptsOpen) setPromptsOpen(false)
  }

  const generatedId = useId()
  const id = composerId ?? generatedId
  const [attachments, setAttachments] = useAtom(composerAttachmentsAtom(id))

  // Seed once, then the atoms own the tray. A passive effect on purpose:
  // jotai (v3) subscribes `useAtom` in its own `useEffect` with no
  // post-subscription recheck, so a `useLayoutEffect` write would land before
  // the subscription exists and the tray would never re-render.
  const seeded = useRef(false)
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
  // The pill has no room for a tray: chips or a draft hold the tall shape open.
  const isExpanded = isFocused || draft.length > 0 || attachments.length > 0
  const isDisabled = disabled || isStreaming
  const showRestHint = !isExpanded && draft.length === 0

  const changeValue = (next: string): void => {
    if (value === undefined) setInternalValue(next)
    onValueChange?.(next)
  }

  const send = useCallback((): void => {
    const trimmed = draft.trim()
    if (!trimmed || isDisabled) return
    onSubmit?.(trimmed, mode, attachments)
    if (value === undefined) setInternalValue("")
  }, [attachments, draft, isDisabled, onSubmit, mode, value])

  // The slot swaps rarely; memoise the motion wrapper so Motion does not see
  // a brand-new component type (and remount the button) on every render.
  const Submit: React.FC<IComposerSubmitButtonProps> =
    SubmitButton ?? (SendButton as React.FC<IComposerSubmitButtonProps>)
  const MotionSubmit = useMemo(() => motion.create(Submit), [Submit])

  // Always mounted: the fade in/out is driven by `animate` alone (opacity
  // tween + y spring), so there is no AnimatePresence exit to freeze mid-flight
  // or unmount early. Collapsed, it is inert and invisible but keeps its slot —
  // the hint's flex-1 absorbs it, so the pill shape never reflows.
  const sendButton = (
    <MotionSubmit
      // Empty-draft must NOT disable: the disabled:opacity-50! rule would
      // pin Motion's inline opacity at 0.5 and break the fade. send() guards
      // empty drafts, and the collapsed button is pointer-events-none.
      disabled={isDisabled && !isStreaming}
      isExpanded={isExpanded}
      isStreaming={isStreaming}
      onStop={() => onSubmit?.("stop")}
      transition={{
        y: BOUNCE_IN_OUT,
        opacity: { duration: 0.16, ease: EASE_OUT },
      }}
      animate={{
        opacity: isExpanded ? 1 : 0,
        y: isExpanded ? 0 : 10,
      }}
      initial={false}
    />
  )

  const renderTextarea = () => (
    <Textarea
      aria-label="Message"
      className={cn(
        "flex w-full flex-1 items-center text-sm text-foreground has-disabled:cursor-not-allowed has-disabled:opacity-50 [&_textarea]:resize-none [&_textarea]:px-2 [&_textarea]:placeholder:text-sm [&_textarea]:placeholder:text-muted-foreground/60",
        // Transition the textarea's own box so the auto-height shell
        // follows smoothly in both directions (expand and collapse).
        "[&_textarea]:transition-[min-height,padding] [&_textarea]:duration-300 [&_textarea]:ease-smooth-out motion-reduce:[&_textarea]:transition-none",
        isExpanded
          ? "[&_textarea]:min-h-14 [&_textarea]:py-2"
          : "h-full [&_textarea]:min-h-0 [&_textarea]:py-0",
        !isExpanded && ComposerMenu && "[&_textarea]:pr-12",
        // The rest state paints its own keycap hint over the field.
        showRestHint && "[&_textarea]:placeholder:text-transparent"
      )}

      disabled={isDisabled}
      onChange={(event) => changeValue(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Escape" && isStreaming) {
          event.preventDefault()
          onSubmit?.("stop")
        }
        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault()
          send()
        }
      }}
      placeholder={placeholder}
      unstyled
      value={draft}
    />
  )

  return (
    <form
      className="w-full max-w-3xl"
      data-expanded={isExpanded ? "" : undefined}
      data-slot="composer"
      onSubmit={(event) => {
        event.preventDefault()
        send()
      }}
    >
      {/* Sibling of the shell, never a child: the shell animates `layout`,
          which Motion runs as a scale, and a list that grows and shrinks
          inside it would drive that scale for an unrelated reason and
          distort the field. The pill just paints over the panel's tucked
          bottom edge instead. */}
      {Suggestions ? (
        <Suggestions onOpenChange={setPromptsOpen} open={promptsOpen} />
      ) : null}
      <motion.div
        // The textarea trades `absolute` for static between the two shapes, so
        // the box's height changes in a single frame. `layout` measures the two
        // boxes and springs between them, which is also what keeps the controls
        // row from teleporting down and swallowing the send hint's slide.
        layout={!reduceMotion}
        className={cn(
          "relative z-10 flex flex-1 flex-col overflow-clip bg-(--chat-field) p-2.5 transition-shadow duration-300 ease-smooth-out",
          isExpanded
            ? "items-end rounded-t-md rounded-b-[calc(var(--radius-md)+--spacing(2.5))] shadow-[inset_0px_0px_7px_1px_rgba(0,_0,_0,_0.2)]"
            : "items-center rounded-full shadow-[inset_0px_0px_5px_-0.5px_rgba(0,_0,_0,_0.3)]",
          "py-2.5 motion-reduce:transition-none",
          className
        )}
        initial={false}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsExpanded(false)
          }
        }}
        onFocus={expand}
        transition={reduceMotion ? { duration: 0 } : SPRING_PANEL}
      >
        {attachments.length > 0 ? (
          <div
            className="flex w-full flex-wrap gap-2 p-1.5"
            data-slot="composer-tray"
          >
            {attachments.map(({ id: itemId, ...item }) => (
              <Attachment
                key={itemId}
                {...item}
                onRemove={() =>
                  setAttachments(attachments.filter((a) => a.id !== itemId))
                }
              />
            ))}
          </div>
        ) : null}
        {/* The shell's `layout` animation is a scale, so the field has to be
            positioned *by* this wrapper, not against the shell — an absolute
            child of the shell leaves the projection tree and inherits that
            scale uncorrected, stretching draft text ~2.3x on collapse. */}
        <motion.div
          className={cn("w-full", !isExpanded && "absolute inset-0 z-10")}
          layout={!reduceMotion && "position"}
          transition={reduceMotion ? { duration: 0 } : SPRING_PANEL}
        >
          {renderTextarea()}
        </motion.div>
        <motion.div
          className={cn(
            "relative flex w-full flex-1 flex-row items-center justify-stretch gap-x-1"
          )}
          layout={!reduceMotion && "position"}
          transition={reduceMotion ? { duration: 0 } : SPRING_PANEL}
        >
          {ComposerMenu && <ComposerMenu />}
          <SendHint className="pl-1" verbose={isExpanded} />
          {sendButton}
        </motion.div>
      </motion.div>
      {safetyNote && (
        <Text.Label
          level="caption"
          className="mt-1 max-w-5/6 pl-1.5 text-[10px]"
        >
          {safetyNote}
        </Text.Label>
      )}
    </form>
  )
}
