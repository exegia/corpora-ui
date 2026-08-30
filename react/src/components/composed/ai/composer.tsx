"use client"

import { useState } from "react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { accentSolid, ArrowUpIcon, ghostMuted, mutedText } from "./shared"
import type { ComposerMode } from "./types"

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
  onModeChange,
  onSend,
  onStop,
  isStreaming = false,
  disabled = false,
  safetyNote = "Changes apply immediately and are recorded in version history. Undo anytime.",
  placeholder = "Ask about this selection…",
  className,
}: ComposerProps): React.ReactElement {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [internalMode, setInternalMode] = useState(defaultMode)
  const draft = value ?? internalValue
  const selectedMode = mode ?? internalMode
  const isDisabled = disabled || isStreaming

  const changeValue = (next: string) => {
    if (value === undefined) setInternalValue(next)
    onValueChange?.(next)
  }

  const send = () => {
    const trimmed = draft.trim()
    if (!trimmed || isDisabled) return
    onSend?.(trimmed, selectedMode)
    if (value === undefined) setInternalValue("")
  }

  return (
    <form
      className={cn("border-t pt-3", className)}
      onSubmit={(event) => {
        event.preventDefault()
        send()
      }}
    >
      <div className="overflow-hidden rounded-sm border bg-muted/30 focus-within:border-ring">
        <Textarea
          unstyled
          className="block w-full text-sm leading-5 text-foreground has-disabled:cursor-not-allowed has-disabled:opacity-50 [&_textarea]:min-h-20 [&_textarea]:resize-none [&_textarea]:px-3 [&_textarea]:py-2.5 [&_textarea]:placeholder:text-muted-foreground/70"
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
        <div className="flex items-center justify-between gap-2 border-t px-2 py-1.5">
          <label className="sr-only" htmlFor={`${selectedMode}-composer-mode`}>
            Composer mode
          </label>
          <select
            aria-label="Composer mode"
            className="max-w-[10.5rem] bg-transparent text-[11px] text-muted-foreground outline-none focus:text-foreground disabled:opacity-50"
            disabled={isDisabled}
            id={`${selectedMode}-composer-mode`}
            onChange={(event) => {
              const next = event.target.value as ComposerMode
              if (mode === undefined) setInternalMode(next)
              onModeChange?.(next)
            }}
            value={selectedMode}
          >
            {MODES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          {isStreaming ? (
            <Button
              className={cn("font-normal", ghostMuted)}
              onClick={onStop}
              size="xs"
              variant="ghost"
            >
              Stop
            </Button>
          ) : (
            <Button
              aria-label="Send message"
              className={accentSolid}
              disabled={isDisabled || !draft.trim()}
              size="icon-xs"
              type="submit"
            >
              <ArrowUpIcon />
            </Button>
          )}
        </div>
      </div>
      {safetyNote ? (
        <p className={cn("mt-2 px-1 text-[11px]", mutedText)}>{safetyNote}</p>
      ) : null}
    </form>
  )
}
