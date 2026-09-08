"use client"

import { Plus } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useCallback, useState } from "react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { BOUNCE_IN_OUT, SPRING_PANEL } from "@/lib/ease"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Text } from "@/components/atoms"
import { Stop } from "iconsax-reactjs"
import { SendHint } from "./shared"
import { SuggestedPrompts } from "./suggested-prompt"
import type { ComposerProps } from "./types"

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
  onStop,
  isStreaming = false,
  disabled = false,
  onAttach,
  attachLabel = "Attach",
  sendLabel = "Send",
  stopLabel = "Stop",
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
  const [isExpanded, setIsExpanded] = useState(expanded)
  const draft = value ?? internalValue
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
    onSend?.(trimmed, selectedMode)
    if (value === undefined) setInternalValue("")
  }, [draft, isDisabled, onSend, selectedMode, value])

  // One attach button for both shapes: it is absolutely positioned in each,
  // so the class swap moves it and `layout` glides it between the two spots
  // rather than mounting a second control.
  const attachButton = onAttach && (
    <motion.div
   //   className={cn("absolute", "bottom-2 left-2")}
      data-slot="composer-attach"
      layout={!reduceMotion && "position"}
      transition={SPRING_PANEL}
    >
      <Button
        aria-label={attachLabel}
        className="[&_svg]:transition-transform bg-background/50 [&_svg]:duration-200 [&_svg]:ease-smooth-out hover:[&_svg]:rotate-90 motion-reduce:hover:[&_svg]:rotate-0"
        disabled={disabled}
        onClick={onAttach}
        size="icon-lg"
        glassVariant="liquid-refract"
        variant="glass"
      >
        <Plus className="size-4 stroke-3" />
      </Button>
    </motion.div>
  )

  const sendButton = (<MotionButton
    aria-label={isStreaming ? "Stop" : "Send message"}
    className={cn(
      "rounded-md px-3",
      isExpanded ? undefined : "hidden"
    )}
    disabled={isStreaming ? false : isDisabled || !draft.trim()}
    onClick={isStreaming ? onStop : undefined}
    size="default"
    transition={BOUNCE_IN_OUT}
    exit={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: isExpanded ? 1 : 0,
      scale: isExpanded ? 1 : 0,
    }}
    initial={{ opacity: 0, scale: 0 }}
    whileHover={{ scale: 1, opacity: 1 }}
    type={isStreaming ? "button" : "submit"}
  >
    {isStreaming ? (
      <>
        <Stop className="size-4 animate-pulse fill-current" />
        {stopLabel}
      </>
    ) : (
      sendLabel
    )}
  </MotionButton>)


  const renderTextarea = () => (
    <Textarea
      aria-label="Message"
      className={cn(
        "flex w-full flex-1 items-center text-sm text-foreground has-disabled:cursor-not-allowed has-disabled:opacity-50 [&_textarea]:resize-none [&_textarea]:px-4 [&_textarea]:placeholder:text-sm [&_textarea]:placeholder:text-muted-foreground/60",
        // Transition the textarea's own box so the auto-height shell
        // follows smoothly in both directions (expand and collapse).
        "[&_textarea]:transition-[min-height,padding] [&_textarea]:duration-300 [&_textarea]:ease-smooth-out motion-reduce:[&_textarea]:transition-none",
        isExpanded
          ? "[&_textarea]:min-h-14 [&_textarea]:py-3"
          : "[&_textarea]:min-h-0 [&_textarea]:py-0 h-full",
        !isExpanded && onAttach && "[&_textarea]:pr-12",
        // The rest state paints its own keycap hint over the field.
        showRestHint && "[&_textarea]:placeholder:text-transparent"
      )}
      size="lg"
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
          defaultOpen={defaultSuggestionsOpen}
          label={suggestionsLabel}
          onOpenChange={onSuggestionsOpenChange}
          open={suggestionsOpen}
        >
          {suggestedPrompts}
        </SuggestedPrompts>
      ) : null}
      <motion.div
        animate={{
      //    borderRadius: isExpanded ? 24 : 21,
        }}
        // The textarea trades `absolute` for static between the two shapes, so
        // the box's height changes in a single frame. `layout` measures the two
        // boxes and springs between them, which is also what keeps the controls
        // row from teleporting down and swallowing the send hint's slide.
        layout={!reduceMotion}
        className={cn(
          "relative z-10 overflow-clip  flex flex-1 flex-col p-1.5  bg-(--chat-field) transition-shadow duration-300 ease-smooth-out",
          isExpanded ? "shadow-[inset_0px_0px_15px_2px_rgba(0,_0,_0,_0.1)] items-end rounded-lg rounded-bl-xl" : "rounded-full items-center shadow-[inset_0px_0px_7px_-1.5px_rgba(0,_0,_0,_0.3)]",
          "motion-reduce:transition-none",
          className
        )}
        initial={false}
      
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsExpanded(false)
          }
        }}
        onFocus={() => setIsExpanded(true)}
        transition={reduceMotion ? { duration: 0 } : SPRING_PANEL}
      >
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
          className={cn("flex items-center flex-1 w-full gap-x-1 relative flex-row")}
          layout={!reduceMotion && "position"}
          transition={reduceMotion ? { duration: 0 } : SPRING_PANEL}
        >
          {attachButton}
          <SendHint  verbose={isExpanded} />
          <AnimatePresence initial={false}>
            {isExpanded && sendButton}
          </AnimatePresence>
        </motion.div>

      </motion.div>
      {safetyNote && (
        <Text.Label level="caption" className="mt-2 max-w-5/6 pl-3 text-xs">
          {safetyNote}
        </Text.Label>
      )}
    </form>
  )
}
