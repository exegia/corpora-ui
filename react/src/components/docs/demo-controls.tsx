import type * as React from "react"

import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
 SelectContent} from "@/components/ui/select"
import { Field, FieldLabel } from "@/components/ui/field"
import { Card , CardContent} from "@/components/ui/card";

/**
 * Lightweight playground controls for registry demos — docs-only, never
 * part of the published library.
 */

export function DemoSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string
  value: T
  options: readonly T[]
  onChange: (value: T) => void
}) {
  const items = options.map((option) => ({ label: option, value: option }))

  return (
    <Field className="flex flex-col gap-1 text-xs text-muted-foreground">
      {label && <FieldLabel>{label}</FieldLabel>}
      <Select
        items={items}
        onValueChange={(next) => onChange(next as T)}
        value={value}
      >
        <SelectTrigger className="h-7 min-w-0 text-xs capitalize rounded-sm " size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

/**
 * Stand-in brand mark for demos of the auth blocks' `logo` slot. Deliberately
 * unbranded — it exists to show the slot's spacing and default sizing, not to
 * represent a real product.
 */
export function DemoBrandMark() {
  return (
    <svg
      aria-label="Example logo"
      role="img"
      viewBox="0 0 32 32"
      className="text-foreground"
    >
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M11 20.5V11.5h4.5a3.5 3.5 0 0 1 0 7H11"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function DemoToggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  )
}

/** Standard layout: centered preview canvas above a wrapping controls row. */
export function DemoStage({
  controls,
  children,
  canvasClassName,
}: {
  controls?: React.ReactNode
  children: React.ReactNode
  canvasClassName?: string
}) {
  return (
    <div className="relative flex w-full flex-col items-center">
      {controls && <Card className="absolute top-3 right-3 z-20 rounded-xl shadow-lg">
        <CardContent className="flex flex-row items-center gap-x-2">{controls}</CardContent>
      </Card>}
      <div
        className={
          canvasClassName ??
          "flex min-h-32 w-full items-center justify-center rounded-lg"
        }
      >
        {children}
      </div>
    </div>
  )
}
