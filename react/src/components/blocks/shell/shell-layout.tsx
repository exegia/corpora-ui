"use client"

import { MenuIcon, PanelRightIcon } from "lucide-react"
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
  rightDrawer,
  rightOpen,
  defaultRightOpen,
  onRightOpenChange,
  variant = "desktop",
  className,
}: ShellLayoutProps): React.ReactElement {

  const background: ClassNameValue = `bg-linear-to-tr/increasing from-neutral-200 via-neutral-100 to-stone-200 dark:from-neutral-900 dark:via-neutral-950 dark:to-stone-950`
  return (
    <AnimatedSidebarProvider
      className={cn("block-full", className, background)}
      defaultOpen={defaultOpen}
      defaultOpenRight={defaultRightOpen}
      onOpenChange={onOpenChange}
      onOpenRightChange={onRightOpenChange}
      open={open}
      openRight={rightOpen}
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
          <div className="flex shrink-0 items-center gap-3">
            <AnimatedSidebarTrigger aria-label="Toggle panel" side="right">
              <PanelRightIcon className="size-5" />
            </AnimatedSidebarTrigger>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
          {children ?? <ShellLayoutPlaceholder />}
        </div>
      </AnimatedSidebarInset>

      <AnimatedSidebar
        ariaLabel="Secondary panel"
        // Below md the panel is portalled over the page, so it carries the
        // surface itself; the desktop rail keeps it on the inner panel.
        className="max-md:border-l max-md:border-neutral-200 max-md:bg-white dark:max-md:border-neutral-700 dark:max-md:bg-card"
        collapsible="offcanvas"
        panelClassName={cn(
          // The offcanvas panel keeps a fixed width so it can slide out of the
          // zero-width rail, so the inset gutter has to come out of that width
          // rather than from a left margin.
          "top-2 ml-0 h-[calc(100%-1rem)] w-[calc(var(--sidebar-width)-0.5rem)]",
          "rounded-lg border-t border-neutral-200 bg-white shadow-md inset-ring-1 inset-ring-neutral-50",
          "dark:border-neutral-700 dark:bg-card dark:inset-ring-black"
        )}
        role="complementary"
        side="right"
        variant="inset"
      >
        {rightDrawer}
      </AnimatedSidebar>
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
