"use client"

import type * as React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/** Lightweight controls for docs demos; never part of the npm surface. */
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
  const items = options.map((option) => ({
    label: option,
    value: option,
  }))

  return (
    <Field className="ml-0 flex w-full flex-1 flex-row items-center justify-between text-muted-foreground">
      {label ? (
        <FieldLabel className="ml-0 capitalize">{label}</FieldLabel>
      ) : null}
      <Select
        items={items}
        onValueChange={(next) => onChange(next as T)}
        value={value}
      >
        <SelectTrigger
          className="h-7 min-w-0 rounded-sm text-xs capitalize"
          size="sm"
        >
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

/** Stand-in brand mark for demos of a block's logo slot. */
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
    <Field className="ml-0 w-full">
      <FieldLabel className="ml-0 w-full justify-between capitalize">
        {label}
        <Switch
          checked={checked}
          onCheckedChange={(value) => onChange(value)}
        />
      </FieldLabel>
    </Field>
  )
}

/** Standard layout: centered preview canvas above a controls row. */
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
      {controls ? (
        <Card className="absolute top-3 right-3 z-20 min-w-48 rounded-lg shadow-lg">
          <CardContent className="flex flex-col items-start gap-2">
            {controls}
          </CardContent>
        </Card>
      ) : null}
      <div
        className={
          canvasClassName ??
          "flex min-h-24 w-full items-center justify-center"
        }
      >
        {children}
      </div>
    </div>
  )
}
