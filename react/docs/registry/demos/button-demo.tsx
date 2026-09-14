import * as React from "react"
import type { VariantProps } from "class-variance-authority"
import { BookOpen } from "lucide-react"

import { DemoSelect, DemoToggle } from "@/components/docs/demo-controls"
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

const BASE_SIZES = ["xs", "sm", "default", "lg", "xl"] as const

type BaseSize = (typeof BASE_SIZES)[number]

// Each base size has an icon-only equivalent, toggled by the icon checkbox.
const ICON_SIZE: Record<BaseSize, Size> = {
  xs: "icon-xs",
  sm: "icon-sm",
  default: "icon",
  lg: "icon-lg",
  xl: "icon-xl",
}

const GLASS_VARIANTS: FrostGlassVariant[] = [
  "liquid-refract",
  "liquid",
  "frosted",
  "clear",
  "subtle",
]

export default function ButtonDemo() {
  const [variant, setVariant] = React.useState<Variant>("outline")
  const [size, setSize] = React.useState<BaseSize>("default")
  const [iconOnly, setIconOnly] = React.useState(false)
  const [glassVariant, setGlassVariant] =
    React.useState<FrostGlassVariant>("liquid-refract")
  const [loading, setLoading] = React.useState(false)
  const [disabled, setDisabled] = React.useState(false)
  const [sound, setSound] = React.useState(true)

  const isGlass = variant === "glass"
  const effectiveSize: Size = iconOnly ? ICON_SIZE[size] : size

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div
        className={cn(
          "flex min-h-28 w-full items-center justify-center rounded-lg",
          // glass finishes need a busy backdrop to show their blur/refraction
          isGlass &&
            "bg-gradient-to-br from-indigo-400 via-rose-300 to-amber-200 dark:from-indigo-950 dark:via-fuchsia-900 dark:to-slate-800"
        )}
      >
        <Button
          {...(isGlass ? { variant, glassVariant } : { variant })}
          size={effectiveSize}
          loading={loading}
          disabled={disabled}
          sound={sound}
        >
          {iconOnly ? <BookOpen /> : "Button"}
        </Button>
      </div>

      <div className="flex flex-wrap items-end justify-center gap-x-4 gap-y-3">
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
          options={BASE_SIZES}
          onChange={setSize}
        />
        <DemoToggle
          label="icon-only"
          checked={iconOnly}
          onChange={setIconOnly}
        />
        <DemoToggle label="loading" checked={loading} onChange={setLoading} />
        <DemoToggle
          label="disabled"
          checked={disabled}
          onChange={setDisabled}
        />
        <DemoToggle label="sound" checked={sound} onChange={setSound} />
      </div>
    </div>
  )
}
