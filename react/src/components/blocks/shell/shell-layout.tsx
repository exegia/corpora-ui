"use client"

import { MenuIcon } from "lucide-react"
import * as React from "react"

import {
  AnimatedSidebar,
  AnimatedSidebarInset,
  AnimatedSidebarProvider,
  AnimatedSidebarTrigger,
} from "@/components/motion/animated-sidebar"
import { cn } from "@/lib/utils"
import type { ShellLayoutProps } from "./type"
import { TITLE_BAR_HEIGHT } from "./utils"
import type { ClassNameValue } from "tailwind-merge"

export function ShellLayout({
  children,
  open,
  defaultOpen,
  onOpenChange,
  variant = "desktop",
  className,
}: ShellLayoutProps): React.ReactElement {

  const background: ClassNameValue = `bg-linear-to-tr/increasing from-neutral-200 via-neutral-100 to-stone-200 dark:from-neutral-900 dark:via-neutral-950 dark:to-stone-950`
  return (
    <AnimatedSidebarProvider
      className={cn("block-full", className, background)}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      open={open}
      style={{
        paddingTop: variant === "desktop" ? TITLE_BAR_HEIGHT : 0,
      //  background: meshBg,
      }}
    >
      <AnimatedSidebar
        ariaLabel="Primary navigation"
        className={cn("")}
        collapsible="icon"
        role="navigation"
        variant="inset"
      ></AnimatedSidebar>

      <AnimatedSidebarInset
        className={cn(
          "min-w-0 overflow-hidden border-t border-neutral-200 dark:border-neutral-700 inset-ring-1 inset-ring-neutral-50 dark:inset-ring-black bg-white dark:bg-card rounded-lg!",
          ``
        )}
      >
        <header className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <AnimatedSidebarTrigger>
              <MenuIcon className="size-5" />
            </AnimatedSidebarTrigger>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
          {children ?? <ShellLayoutPlaceholder />}
        </div>
      </AnimatedSidebarInset>
    </AnimatedSidebarProvider>
  )
}

function ShellLayoutPlaceholder() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-5 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            className="h-32 border border-border bg-background/60"
            key={index}
          />
        ))}
      </div>
      <div className="h-72 border border-border bg-background/60" />
    </div>
  )
}
