"use client"

import * as React from "react"
import type { VariantProps } from "class-variance-authority"
import { BookOpen } from "lucide-react"

import { DemoSelect } from "@/components/docs/demo-controls"
import { Button, buttonVariants } from "@/components/ui/button"
import type { FrostGlassVariant } from "@/lib/glass-variants"
import { cn } from "@/lib/utils"

type Variant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>
type Size = NonNullable<VariantProps<typeof buttonVariants>["size"]>

const VARIANTS: Variant[] = [
  "default",
  "secondary",
  "outline",
  "destructive",
  "destructive-outline",
  "ghost",
  "link",
  "glass",
]

const SIZES: Size[] = [
  "xs",
  "sm",
  "default",
  "lg",
  "xl",
  "icon-xs",
  "icon-sm",
  "icon",
  "icon-lg",
  "icon-xl",
]

const GLASS_VARIANTS: FrostGlassVariant[] = [
  "liquid-refract",
  "liquid",
  "frosted",
  "clear",
  "subtle",
]

export default function ButtonDemo() {
  const [variant, setVariant] = React.useState<Variant>("outline")
  const [size, setSize] = React.useState<Size>("default")
  const [glassVariant, setGlassVariant] =
    React.useState<FrostGlassVariant>("liquid-refract")
  const [loading, setLoading] = React.useState(false)
  const [disabled, setDisabled] = React.useState(false)
  const [sound, setSound] = React.useState(true)

  const isGlass = variant === "glass"
  const isIconSize = size.startsWith("icon")

  return (
    <div className="gap-6 flex w-full flex-col items-center">
      <div
        className={cn(
          "min-h-28 flex w-full items-center justify-center rounded-lg",
          // glass finishes need a busy backdrop to show their blur/refraction
          isGlass &&
            "from-indigo-400 via-rose-300 to-amber-200 dark:from-indigo-950 dark:via-fuchsia-900 dark:to-slate-800 bg-gradient-to-br"
        )}
      >
        <Button
          {...(isGlass ? { variant, glassVariant } : { variant })}
          size={size}
          loading={loading}
          disabled={disabled}
          sound={sound}
          aria-label={isIconSize ? "Open manuscript" : undefined}
        >
          {isIconSize ? <BookOpen aria-hidden /> : "Button"}
        </Button>
      </div>

      <div className="gap-x-4 gap-y-3 flex flex-wrap items-end justify-center">
        <DemoSelect
          label="variant"
          value={variant}
          options={VARIANTS}
          onChange={setVariant}
        />
        {isGlass && (
          <DemoSelect
            label="glassVariant"
            value={glassVariant}
            options={GLASS_VARIANTS}
            onChange={setGlassVariant}
          />
        )}
        <DemoSelect
          label="size"
          value={size}
          options={SIZES}
          onChange={setSize}
        />
        <BooleanRadio label="loading" value={loading} onChange={setLoading} />
        <BooleanRadio
          label="disabled"
          value={disabled}
          onChange={setDisabled}
        />
        <BooleanRadio label="sound" value={sound} onChange={setSound} />
      </div>
    </div>
  )
}

function BooleanRadio({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  const name = React.useId()

  return (
    <fieldset className="min-w-32 gap-1 text-xs flex flex-col text-muted-foreground">
      <legend className="capitalize">{label}</legend>
      <div className="p-0.5 flex rounded-sm border bg-background">
        {[true, false].map((option) => (
          <label
            className="rounded-xs px-2 py-1 cursor-pointer has-checked:bg-accent has-checked:text-accent-foreground"
            key={String(option)}
          >
            <input
              className="sr-only"
              checked={value === option}
              name={name}
              onChange={() => onChange(option)}
              type="radio"
            />
            {String(option)}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
