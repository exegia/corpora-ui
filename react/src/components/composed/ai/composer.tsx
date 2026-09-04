"use client"

import { Plus } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useCallback, useState } from "react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { EASE_IN_OUT, SPRING_PANEL } from "@/lib/ease"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Text } from "@/components/atoms"
import { Stop } from "iconsax-reactjs"
import { SendHint } from "./shared"
import type { ComposerProps } from "./types"

// `ComposerProps` moved to `types.ts`; both the barrel and `ai-panel` still
// reach for it here, so keep this module the address it has always had.
export type { ComposerProps }

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
      className={cn(
        "absolute",
       "bottom-2 left-2" 
      )}
      data-slot="composer-attach"
      layout={reduceMotion ? false : "position"}
      transition={SPRING_PANEL}
    >
      <Button
        aria-label={attachLabel}
        className="size-7 rounded-full border-black/10 bg-black/5 text-muted-foreground hover:bg-black/10 hover:text-foreground data-pressed:bg-black/10 dark:border-white/10 dark:bg-white/6 dark:hover:bg-white/12 dark:data-pressed:bg-white/12 sm:size-7 [&_svg]:transition-transform [&_svg]:duration-200 [&_svg]:ease-smooth-out hover:[&_svg]:rotate-90 motion-reduce:hover:[&_svg]:rotate-0"
        disabled={disabled}
        onClick={onAttach}
        size="icon-xs"
        variant="ghost"
      >
        <Plus className="size-4" />
      </Button>
    </motion.div>
  )

  return (
    <form
      className={cn(className)}
      data-expanded={isExpanded ? "" : undefined}
      data-slot="composer"
      onSubmit={(event) => {
        event.preventDefault()
        send()
      }}
    >
      <motion.div
        animate={{ borderRadius: isExpanded ? 14 : 21 }}
        className={cn(
          "relative overflow-hidden bg-(--chat-field) transition-shadow duration-300 ease-smooth-out",
          isExpanded ? "shadow-composer-open" : "shadow-composer",
          "motion-reduce:transition-none"
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
        <Textarea
          aria-label="Message"
          className={cn(
            "flex w-full flex-1 items-center text-sm text-foreground has-disabled:cursor-not-allowed has-disabled:opacity-50 [&_textarea]:resize-none [&_textarea]:px-4 [&_textarea]:placeholder:text-sm [&_textarea]:placeholder:text-muted-foreground/60",
            // Transition the textarea's own box so the auto-height shell
            // follows smoothly in both directions (expand and collapse).
            "[&_textarea]:transition-[min-height,padding] [&_textarea]:duration-300 [&_textarea]:ease-smooth-out motion-reduce:[&_textarea]:transition-none",
            isExpanded
              ? "[&_textarea]:min-h-14 [&_textarea]:py-3"
              : "[&_textarea]:min-h-11 [&_textarea]:py-3",
            !isExpanded && onAttach && "[&_textarea]:pr-12",
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

        <AnimatePresence initial={false}>
          {showRestHint && (
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              className="pointer-events-none absolute inset-y-0 left-4 flex items-center"
              exit={{ opacity: 0, x: reduceMotion ? 0 : -6 }}
              initial={{ opacity: 0, x: reduceMotion ? 0 : -6 }}
              key="rest-hint"
              transition={{ duration: 0.18, ease: EASE_IN_OUT }}
            >
              <SendHint />
            </motion.div>
          )}
        </AnimatePresence>

        {attachButton}

        <AnimatePresence initial={false}>
          {isExpanded ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-center justify-end gap-3 px-2.5 pb-2.5",
                onAttach && "pl-12"
              )}
              exit={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
              key="composer-footer"
              transition={reduceMotion ? { duration: 0 } : SPRING_PANEL}
            >
              <div className="flex items-center gap-3">
                <SendHint className="max-sm:hidden" verbose={false} />
                <Button
                  aria-label={isStreaming ? "Stop" : "Send message"}
                  className={cn(
                    "h-8 rounded-[13px] border-transparent px-3.5 text-[15px] font-medium sm:h-8",
                    isStreaming
                      ? "bg-neutral-800 text-white hover:bg-neutral-700 data-pressed:bg-neutral-700"
                      : "bg-[#F3BA20] text-[#080808] shadow-send hover:bg-[#F7C63A] data-pressed:bg-[#E5AE1A] disabled:shadow-none"
                  )}
                  disabled={isStreaming ? false : isDisabled || !draft.trim()}
                  onClick={isStreaming ? onStop : undefined}
                  size="sm"
                  type={isStreaming ? "button" : "submit"}
                  variant="ghost"
                >
                  {isStreaming ? (
                    <>
                      <Stop className="size-4 animate-pulse fill-current" />
                      {stopLabel}
                    </>
                  ) : (
                    sendLabel
                  )}
                </Button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
      {safetyNote && (
        <Text.Label level="caption" className="mt-2 px-1.5">
          {safetyNote}
        </Text.Label>
      )}
    </form>
  )
}
