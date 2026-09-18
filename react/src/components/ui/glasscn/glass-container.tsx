"use client"

import * as React from "react"

import {
  type TFrostGlassVariant,
} from "@/lib/glass-variants"
import { cn } from "@/lib/utils"
import { LiquidGlass } from "./liquid-glass"

const glassSidebarVariableStyles: Record<TFrostGlassVariant, string> = {
  clear: [
    "[--sidebar:rgba(255,255,255,0.18)]",
    "[--sidebar-foreground:oklch(0.145_0_0)]",
    "[--sidebar-accent:rgba(255,255,255,0.48)]",
    "[--sidebar-accent-foreground:oklch(0.145_0_0)]",
    "[--sidebar-border:rgba(255,255,255,0.34)]",
    "[--sidebar-ring:rgba(255,255,255,0.38)]",
    "dark:[--sidebar:rgba(0,0,0,0.28)]",
    "dark:[--sidebar-foreground:oklch(0.985_0_0)]",
    "dark:[--sidebar-accent:rgba(255,255,255,0.1)]",
    "dark:[--sidebar-accent-foreground:oklch(0.985_0_0)]",
    "dark:[--sidebar-border:rgba(255,255,255,0.12)]",
    "dark:[--sidebar-ring:rgba(255,255,255,0.16)]",
  ].join(" "),
  frosted: [
    "[--sidebar:rgba(255,255,255,0.4)]",
    "[--sidebar-foreground:oklch(0.145_0_0)]",
    "[--sidebar-accent:rgba(255,255,255,0.62)]",
    "[--sidebar-accent-foreground:oklch(0.145_0_0)]",
    "[--sidebar-border:rgba(255,255,255,0.3)]",
    "[--sidebar-ring:rgba(255,255,255,0.32)]",
    "dark:[--sidebar:rgba(0,0,0,0.38)]",
    "dark:[--sidebar-foreground:oklch(0.985_0_0)]",
    "dark:[--sidebar-accent:rgba(255,255,255,0.14)]",
    "dark:[--sidebar-accent-foreground:oklch(0.985_0_0)]",
    "dark:[--sidebar-border:rgba(255,255,255,0.1)]",
    "dark:[--sidebar-ring:rgba(255,255,255,0.14)]",
  ].join(" "),
  subtle: [
    "[--sidebar:rgba(255,255,255,0.14)]",
    "[--sidebar-foreground:oklch(0.145_0_0)]",
    "[--sidebar-accent:rgba(255,255,255,0.28)]",
    "[--sidebar-accent-foreground:oklch(0.145_0_0)]",
    "[--sidebar-border:rgba(0,0,0,0.05)]",
    "[--sidebar-ring:rgba(255,255,255,0.28)]",
    "dark:[--sidebar:rgba(255,255,255,0.05)]",
    "dark:[--sidebar-foreground:oklch(0.985_0_0)]",
    "dark:[--sidebar-accent:rgba(255,255,255,0.08)]",
    "dark:[--sidebar-accent-foreground:oklch(0.985_0_0)]",
    "dark:[--sidebar-border:rgba(255,255,255,0.08)]",
    "dark:[--sidebar-ring:rgba(255,255,255,0.12)]",
  ].join(" "),
  liquid: [
    "[--sidebar:rgba(255,255,255,0.22)]",
    "[--sidebar-foreground:oklch(0.145_0_0)]",
    "[--sidebar-accent:rgba(255,255,255,0.55)]",
    "[--sidebar-accent-foreground:oklch(0.145_0_0)]",
    "[--sidebar-border:rgba(255,255,255,0.42)]",
    "[--sidebar-ring:rgba(255,255,255,0.45)]",
    "dark:[--sidebar:rgba(255,255,255,0.06)]",
    "dark:[--sidebar-foreground:oklch(0.985_0_0)]",
    "dark:[--sidebar-accent:rgba(255,255,255,0.12)]",
    "dark:[--sidebar-accent-foreground:oklch(0.985_0_0)]",
    "dark:[--sidebar-border:rgba(255,255,255,0.16)]",
    "dark:[--sidebar-ring:rgba(255,255,255,0.20)]",
  ].join(" "),
  "liquid-refract": [
    "[--sidebar:rgba(255,255,255,0.18)]",
    "[--sidebar-foreground:oklch(0.145_0_0)]",
    "[--sidebar-accent:rgba(255,255,255,0.48)]",
    "[--sidebar-accent-foreground:oklch(0.145_0_0)]",
    "[--sidebar-border:rgba(255,255,255,0.34)]",
    "[--sidebar-ring:rgba(255,255,255,0.38)]",
    "dark:[--sidebar-foreground:oklch(0.985_0_0)]",
    "dark:[--sidebar-accent:rgba(255,255,255,0.12)]",
    "dark:[--sidebar-accent-foreground:oklch(0.985_0_0)]",
    "dark:[--sidebar-border:rgba(255,255,255,0.15)]",
    "dark:[--sidebar-ring:rgba(255,255,255,0.18)]",
  ].join(" "),
}

type TGlassSidebarProps = React.ComponentProps<typeof LiquidGlass>

function GlassContainer({ glassVariant = "liquid-refract", className, ...props }: TGlassSidebarProps) {
  return <LiquidGlass
    glassVariant={glassVariant}
    className={cn("rounded-[1.75rem]", glassSidebarVariableStyles[glassVariant], className)}
    {...props}
  />
}

export { GlassContainer, glassSidebarVariableStyles }
export type { TFrostGlassVariant } from "@/lib/glass-variants"
