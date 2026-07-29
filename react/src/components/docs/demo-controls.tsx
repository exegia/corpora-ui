import type * as React from "react"

/**
 * Lightweight playground controls for registry demos. Plain native elements
 * on purpose — docs-only, never part of the published library.
 */

export function DemoSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly T[]
  onChange: (value: T) => void
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-7 rounded-md border bg-background px-2 text-xs text-foreground"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
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
  controls: React.ReactNode
  children: React.ReactNode
  canvasClassName?: string
}) {
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div
        className={
          canvasClassName ??
          "flex min-h-28 w-full items-center justify-center rounded-lg"
        }
      >
        {children}
      </div>
      <div className="flex flex-wrap items-end justify-center gap-x-4 gap-y-3">
        {controls}
      </div>
    </div>
  )
}
