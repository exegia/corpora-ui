"use client"

import { motion, useReducedMotion } from "motion/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { SPRING_LAYOUT } from "@/lib/ease"
import { playCue } from "@/lib/sound"

export interface SegmentedToggleOption<T extends string> {
  value: T
  label: React.ReactNode
}

export interface SegmentedToggleProps<T extends string> extends Omit<React.ComponentPropsWithoutRef<"div">, "onChange" | "defaultValue"> {
  options: readonly SegmentedToggleOption<T>[]
  value?: T
  defaultValue?: T
  onValueChange?: (value: T) => void
  /** Accessible group name. */
  label?: string
  sound?: boolean
}

/**
 * Two-or-more segment switch with a sliding active pill.
 *
 * @sketch "Atom / Segmented Toggle", "Atom / Segmented Toggle / Right"
 */
export function SegmentedToggle<T extends string>({
  options,
  value,
  defaultValue,
  onValueChange,
  label,
  sound = true,
  className,
  ...props
}: SegmentedToggleProps<T>): React.ReactElement {
  const reduceMotion = useReducedMotion()
  const layoutId = React.useId()
  const [internal, setInternal] = React.useState<T>(defaultValue ?? options[0].value)
  const current = value ?? internal

  const select = (next: T) => {
    if (next === current) return
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
    if (sound) playCue("toggle")
  }

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0
    if (!delta) return
    e.preventDefault()
    const next = options[(index + delta + options.length) % options.length]
    select(next.value)
    ;(e.currentTarget.parentElement?.querySelector(`[data-value="${next.value}"]`) as HTMLElement | null)?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      data-slot="segmented-toggle"
      className={cn("inline-flex h-6 items-center rounded-md bg-surface-subtle p-0.5", className)}
      {...props}
    >
      {options.map((option, index) => {
        const active = option.value === current
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            data-value={option.value}
            tabIndex={active ? 0 : -1}
            onClick={() => select(option.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              "relative h-5 rounded-[5px] px-2 text-[11px] font-medium leading-none outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              active ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
            )}
          >
            {active ? (
              <motion.span
                aria-hidden="true"
                layoutId={layoutId}
                transition={reduceMotion ? { duration: 0 } : SPRING_LAYOUT}
                className="absolute inset-0 rounded-[5px] bg-surface-card shadow-[0_1px_2px_rgb(0_0_0/0.12)] dark:shadow-[0_1px_2px_rgb(0_0_0/0.5)]"
              />
            ) : null}
            <span className="relative">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
