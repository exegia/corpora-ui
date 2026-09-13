"use client"

import { Plus } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { useAtom } from "jotai"
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { BOUNCE_IN_OUT, EASE_OUT, SPRING_PANEL } from "@/lib/ease"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MenuCommand } from "@/components/ui/menu-command"
import { Text } from "@/components/atoms"
import { Attachment } from "@/components/composed/chat"
import { SendHint } from "./shared"
import { SuggestedPrompts } from "./suggested-prompt"
import type { ComposerProps } from "./types"
import { ArrowUp, Squircle } from "lucide"
import { MorphIcon } from "morphicons/react"
import { composerAttachmentsAtom, removeComposerInstance } from "./composer-attachments-atom"

// `ComposerProps` moved to `types.ts`; both the barrel and `ai-panel` still
// reach for it here, so keep this module the address it has always had.
export type { ComposerProps }

const MotionButton = motion.create(Button)

/**
 * Prompt field with two shapes: a pill at rest showing the "⌘ + ↵" hint,
 * that squares off into a taller field on focus with the attach and Send
 * controls springing in along its bottom edge.
 */
export function Composer({
  value,
  defaultValue = "",
  onValueChange,
  mode,
  defaultMode = "answer",
  onSend,
  composerId,
  defaultAttachments,
  onStop,
  isStreaming = false,
  disabled = false,
  onAttach,
  attachLabel = "Attach",
  commands,
  onCommand,
  safetyNote = "Changes apply immediately and are recorded in version history. Undo anytime.",
  expanded = false,
  placeholder = "Ask about this selection…",
  suggestedPrompts,
  suggestionsLabel,
  defaultSuggestionsOpen,
  suggestionsOpen,
  onSuggestionsOpenChange,
  className,
}: ComposerProps): React.ReactElement {
  const reduceMotion = useReducedMotion()
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [internalMode] = useState(defaultMode)
  const [isFocused, setIsExpanded] = useState(expanded)
  // The prompts fold when the field expands: the two never stack open.
  const [internalPromptsOpen, setInternalPromptsOpen] = useState(
    defaultSuggestionsOpen ?? true
  )
  const promptsOpen = suggestionsOpen ?? internalPromptsOpen
  const setPromptsOpen = (next: boolean): void => {
    if (suggestionsOpen === undefined) setInternalPromptsOpen(next)
    onSuggestionsOpenChange?.(next)
  }
  const expand = (): void => {
    setIsExpanded(true)
    if (promptsOpen) setPromptsOpen(false)
  }
  const generatedId = useId()
  const id = composerId ?? generatedId
  const [attachments, setAttachments] = useAtom(composerAttachmentsAtom(id))
  // Seed once, then the atoms own the tray.
  const seeded = useRef(false)
  useLayoutEffect(() => {
    if (seeded.current) return
    seeded.current = true
    if (defaultAttachments?.length) setAttachments(defaultAttachments)
  }, [defaultAttachments, setAttachments])
  useEffect(() => {
    if (composerId) return
    return () => removeComposerInstance(id)
  }, [composerId, id])
  const draft = value ?? internalValue
  // The pill has no room for a tray: chips or a draft hold the tall shape open.
  const isExpanded = isFocused || draft.length > 0 || attachments.length > 0
  const selectedMode = mode ?? internalMode
  const isDisabled = disabled || isStreaming
  const showRestHint = !isExpanded && draft.length === 0

  const changeValue = (next: string): void => {
    if (value === undefined) setInternalValue(next)
    onValueChange?.(next)
  }

  const send = useCallback((): void => {
    const trimmed = draft.trim()
    if (!trimmed || isDisabled) return
    onSend?.(trimmed, selectedMode, attachments)
    if (value === undefined) setInternalValue("")
  }, [attachments, draft, isDisabled, onSend, selectedMode, value])

  // One attach button for both shapes: it is absolutely positioned in each,
  // so the class swap moves it and `layout` glides it between the two spots
  // rather than mounting a second control.
  const plusButton = (
    <Button
      aria-label={attachLabel}
      className="[&_svg]:transition-transform bg-background/50 [&_svg]:duration-200 [&_svg]:ease-smooth-out hover:[&_svg]:rotate-90 motion-reduce:hover:[&_svg]:rotate-0 data-popup-open:[&_svg]:rotate-45"
      disabled={disabled}
      onClick={commands ? undefined : onAttach}
      size="icon-lg"
      glassVariant="liquid-refract"
      variant="glass"
    >
      <Plus className="size-4 stroke-3" />
    </Button>
  )
  const attachButton = (onAttach || commands) && (
    <motion.div
      data-slot="composer-attach"
      layout={!reduceMotion && "position"}
      className="z-20"
      transition={SPRING_PANEL}
    >
      {commands ? (
        <MenuCommand items={commands} onSelect={onCommand}>
          {plusButton}
        </MenuCommand>
      ) : (
        plusButton
      )}
    </motion.div>
  )

  // Always mounted: the fade in/out is driven by `animate` alone (opacity
  // tween + y spring), so there is no AnimatePresence exit to freeze mid-flight
  // or unmount early. Collapsed, it is inert and invisible but keeps its slot —
  // the hint's flex-1 absorbs it, so the pill shape never reflows.
  const sendButton = (
    <MotionButton
      aria-hidden={!isExpanded}
      aria-label={isStreaming ? "Stop" : "Send message"}
      className={cn("shrink-0 justify-self-center", !isExpanded && "pointer-events-none")}
      // Empty-draft must NOT disable: the disabled:opacity-50! rule would
      // pin Motion's inline opacity at 0.5 and break the fade. send() guards
      // empty drafts, and the collapsed button is pointer-events-none.
      disabled={isDisabled && !isStreaming}
      onClick={isStreaming ? onStop : undefined}
      transition={{
        y: BOUNCE_IN_OUT,
        opacity: { duration: 0.16, ease: EASE_OUT },
      }}
      animate={{
        opacity: isExpanded ? 1 : 0,
        y: isExpanded ? 0 : 10,
      }}
      initial={false}
      size="icon-lg"
      tabIndex={isExpanded ? 0 : -1}
      type={isStreaming ? "button" : "submit"}
    >
      <MorphIcon className={cn("size-4 rounded-full", isStreaming ? "animate-pulse fill-current" : "stroke-2")} icon={isStreaming ? Squircle : ArrowUp} />
    </MotionButton>
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
          : "[&_textarea]:min-h-0 [&_textarea]:py-0 h-full",
        !isExpanded && (onAttach || commands) && "[&_textarea]:pr-12",
        // The rest state paints its own keycap hint over the field.
        showRestHint && "[&_textarea]:placeholder:text-transparent"
      )}
   
      disabled={isDisabled}
      onChange={(event) => changeValue(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Escape" && isStreaming) {
          event.preventDefault()
          onStop?.()
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
      {suggestedPrompts ? (
        <SuggestedPrompts
          label={suggestionsLabel}
          onOpenChange={setPromptsOpen}
          open={promptsOpen}
        >
          {suggestedPrompts}
        </SuggestedPrompts>
      ) : null}
      <motion.div
        // The textarea trades `absolute` for static between the two shapes, so
        // the box's height changes in a single frame. `layout` measures the two
        // boxes and springs between them, which is also what keeps the controls
        // row from teleporting down and swallowing the send hint's slide.
        layout={!reduceMotion}
        className={cn(
          "relative z-10 overflow-clip  flex flex-1 flex-col p-2.5  bg-(--chat-field) transition-shadow duration-300 ease-smooth-out",
          isExpanded
            ? "shadow-[inset_0px_0px_7px_1px_rgba(0,_0,_0,_0.2)] items-end rounded-t-md rounded-b-[calc(var(--radius-md)+--spacing(2.5))]"
            : "rounded-full items-center shadow-[inset_0px_0px_5px_-0.5px_rgba(0,_0,_0,_0.3)]",
          "motion-reduce:transition-none py-2.5",
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
          <div className="flex w-full flex-wrap gap-2 p-1.5" data-slot="composer-tray">
            {attachments.map(({ id: itemId, ...item }) => (
              <Attachment
                key={itemId}
                {...item}
                onRemove={() => setAttachments(attachments.filter((a) => a.id !== itemId))}
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
          className={cn("flex flex-1 items-center w-full gap-x-1 relative justify-stretch flex-row")}
          layout={!reduceMotion && "position"}
          transition={reduceMotion ? { duration: 0 } : SPRING_PANEL}
        >
          {attachButton}
          <SendHint className="pl-1"  verbose={isExpanded} />
          {sendButton}
        </motion.div>

      </motion.div>
      {safetyNote && (
        <Text.Label level="caption" className="mt-1 max-w-5/6 pl-1.5 text-[10px]">
          {safetyNote}
        </Text.Label>
      )}
    </form>
  )
}
