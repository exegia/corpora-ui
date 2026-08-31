"use client"

import { useCallback, useMemo, useState } from "react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { ComposerMode } from "./types"
import { Stop, ArrowUp } from "iconsax-reactjs"
import { Text } from "@/components/atoms"
import { AnimatePresence, motion } from "motion/react"

const SHELL_TRANSITION = {
  type: "spring",
  duration: 2,
  bounce: 0,
} as const

const MODES: readonly { value: ComposerMode; label: string }[] = [
  { value: "answer", label: "Answer only" },
  { value: "fix", label: "Fix node" },
  { value: "ask", label: "Ask only · edits locked" },
]

export interface ComposerProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  mode?: ComposerMode
  defaultMode?: ComposerMode
  onModeChange?: (mode: ComposerMode) => void
  onSend?: (value: string, mode: ComposerMode) => void
  expanded?: boolean
  onStop?: () => void
  isStreaming?: boolean
  disabled?: boolean
  safetyNote?: React.ReactNode
  placeholder?: string
  className?: string
}

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
  safetyNote = "Changes apply immediately and are recorded in version history. Undo anytime.",
  expanded = false,
  placeholder = "Ask about this selection…",
  className,
}: ComposerProps): React.ReactElement {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [internalMode] = useState(defaultMode)
  const [isExpanded, setIsExpanded] = useState(expanded)
  const draft = value ?? internalValue
  const selectedMode = mode ?? internalMode
  const isDisabled = disabled || isStreaming

  const changeValue = (next: string) => {
    if (value === undefined) setInternalValue(next)
    onValueChange?.(next)
  }

  const send = useCallback(() => {
    const trimmed = draft.trim()
    if (!trimmed || isDisabled) return
    onSend?.(trimmed, selectedMode)
    if (value === undefined) setInternalValue("")
  }, [draft, isDisabled, onSend, selectedMode, value])

  const renderFooter = useMemo(
    () => (
      <motion.div
        key="composer-footer"
        className={cn(
          "absolute right-2 bottom-2 flex items-center justify-end gap-2"
        )}
        initial={{ opacity: 0, y: 8, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.9 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        <Button
          className={cn(
            "cursor-pointer",
            !isStreaming ? "bg-amber-400!" : undefined
          )}
          aria-label={isStreaming ? "Stop" : "Send message"}
          size="icon-sm"
          glassVariant="subtle"
          variant="glass"
          onClick={isStreaming ? onStop : send}
          disabled={isDisabled || !draft.trim()}
          type="submit"
        >
          {isStreaming ? (
            <Stop className="animate-pulse fill-black dark:fill-white" />
          ) : (
            <ArrowUp color="black" />
          )}
        </Button>
      </motion.div>
    ),
    [draft, isDisabled, isStreaming, onStop, send]
  )

  return (
    <form
      className={cn(className)}
      onSubmit={(event) => {
        event.preventDefault()
        send()
      }}
    >
      <motion.div
        className={cn(
          "relative overflow-hidden border-2 border-border/70 bg-popover shadow-xs focus-within:border-ring dark:bg-neutral-950"
        )}
        initial={false}
        animate={{
          borderTopLeftRadius: isExpanded ? 10 : 18,
          borderTopRightRadius: isExpanded ? 10 : 18,
          borderBottomLeftRadius: isExpanded ? 10 : 18,
          borderBottomRightRadius: 18,
        }}
        transition={SHELL_TRANSITION}
        onFocus={() => setIsExpanded(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsExpanded(false)
          }
        }}
      >
        <Textarea
          unstyled
          className={cn(
            "flex w-full flex-1 items-center text-sm text-foreground has-disabled:cursor-not-allowed has-disabled:opacity-50 [&_textarea]:resize-none [&_textarea]:px-3 [&_textarea]:placeholder:text-[13px] [&_textarea]:placeholder:text-muted-foreground/60",
            // Transition the textarea's own box so the auto-height shell
            // follows smoothly in both directions (expand and collapse).
            "[&_textarea]:transition-[min-height,padding] [&_textarea]:duration-150 [&_textarea]:ease-out motion-reduce:[&_textarea]:transition-none",
            isExpanded
              ? "[&_textarea]:min-h-20 [&_textarea]:py-2.5"
              : "[&_textarea]:min-h-8 [&_textarea]:py-1.5"
          )}
          aria-label="Message"
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
          value={draft}
        />
        <AnimatePresence>{isExpanded && renderFooter}</AnimatePresence>
      </motion.div>
      {safetyNote && (
        <Text.Label level="caption" className="mt-2 px-1.5">
          {safetyNote}
        </Text.Label>
      )}
    </form>
  )
}
