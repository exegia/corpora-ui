"use client"

import { useEffect, useId, useRef, useState } from "react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { accentRing, AiIcon, surface } from "./shared"
import type { AiScope, AiScopeKind } from "./types"

export const AI_SCOPE_LEVELS: readonly AiScopeKind[] = [
  "word",
  "passage",
  "articulus",
  "quaestio",
  "corpus",
]

export interface ScopePickerProps {
  value?: AiScopeKind
  defaultValue?: AiScopeKind
  onValueChange?: (value: AiScopeKind) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  scope?: Omit<AiScope, "kind"> & { kind?: AiScopeKind }
  className?: string
}

export function ScopePicker({
  value,
  defaultValue = "word",
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  scope,
  className,
}: ScopePickerProps): React.ReactElement {
  const id = useId()
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const listRef = useRef<HTMLDivElement>(null)
  const isControlled = value !== undefined
  const selected = value ?? uncontrolledValue
  const isOpen = openProp ?? uncontrolledOpen

  const setOpen = (next: boolean) => {
    if (openProp === undefined) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  const select = (next: AiScopeKind) => {
    if (!isControlled) setUncontrolledValue(next)
    onValueChange?.(next)
    setOpen(false)
  }

  useEffect(() => {
    if (isOpen) {
      const option = listRef.current?.querySelector<HTMLElement>(
        `[data-scope-option="${selected}"]`
      )
      option?.focus()
    }
  }, [isOpen, selected])

  const move = (event: React.KeyboardEvent<HTMLDivElement>, delta: number) => {
    const current = AI_SCOPE_LEVELS.indexOf(selected)
    const next =
      AI_SCOPE_LEVELS[
        (current + delta + AI_SCOPE_LEVELS.length) % AI_SCOPE_LEVELS.length
      ]
    event.preventDefault()
    if (event.key === "Enter" || event.key === " ") {
      select(next)
      return
    }
    if (!isControlled) setUncontrolledValue(next)
    onValueChange?.(next)
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        aria-controls={isOpen ? id : undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn("border font-normal text-muted-foreground hover:text-foreground", accentRing)}
        onClick={() => setOpen(!isOpen)}
        size="xs"
        variant="ghost"
      >
        <AiIcon className="text-xs" />
        Add scope
      </Button>
      {isOpen ? (
        <div
          aria-label="Scope level"
          className={cn(
            "absolute top-10 right-0 z-20 w-48 rounded-sm p-1",
            surface
          )}
          id={id}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault()
              setOpen(false)
              return
            }
            if (event.key === "ArrowDown") move(event, 1)
            if (event.key === "ArrowUp") move(event, -1)
            if (event.key === "Enter" || event.key === " ") move(event, 0)
          }}
          ref={listRef}
          role="listbox"
          tabIndex={-1}
        >
          {AI_SCOPE_LEVELS.map((kind) => (
            <button
              aria-selected={selected === kind}
              className="flex min-h-9 w-full items-center justify-between rounded-sm px-2.5 text-left text-sm text-foreground/80 capitalize outline-none hover:bg-muted focus-visible:bg-amber-400/12 focus-visible:text-amber-700 dark:focus-visible:text-amber-300"
              data-scope-option={kind}
              key={kind}
              onClick={() => select(kind)}
              role="option"
              tabIndex={selected === kind ? 0 : -1}
              type="button"
            >
              {kind}
              {selected === kind ? <span aria-hidden="true">✓</span> : null}
            </button>
          ))}
        </div>
      ) : null}
      {scope ? (
        <span className="sr-only">
          Current scope: {scope.label ?? selected}
        </span>
      ) : null}
    </div>
  )
}
