"use client"

import { MotionIcon } from "motion-icons-react"
import * as React from "react"

import {
  AnimatedSidebar,
  AnimatedSidebarInset,
  AnimatedSidebarProvider,
  AnimatedSidebarTrigger,
} from "@/components/motion/animated-sidebar"
import { cn } from "@/lib/utils"
import type { ShellLayoutProps, ShellPanelControlProps } from "./type"
import { TITLE_BAR_HEIGHT } from "./utils"
import type { ClassNameValue } from "tailwind-merge"

export function ShellLayout({
  children,
  variant = "desktop",
  panels,
  className,
  defaultOpen,
  ...panelControlProps
}: ShellLayoutProps): React.ReactElement {

  const background: ClassNameValue = `bg-linear-to-tr/increasing from-neutral-200 via-neutral-100 to-stone-200 dark:from-neutral-900 dark:via-neutral-950 dark:to-stone-950`

  // Each panel seeds its own side's initial state (`defaultOpen ?? open`);
  // an explicit `defaultOpen` record — usually from useShellPanels — wins
  // per side.
  const initialOpen: ShellPanelControlProps["defaultOpen"] = {
    ...(panels?.left && {
      left: panels.left.defaultOpen ?? panels.left.open,
    }),
    ...(panels?.right && {
      right: panels.right.defaultOpen ?? panels.right.open,
    }),
    ...(defaultOpen)
  }

  return (
    <AnimatedSidebarProvider
      {...panelControlProps}
      defaultOpen={initialOpen}
      className={cn("block-full", className, background, "relative pr-2")}
      style={{
        paddingTop: variant === "desktop" ? TITLE_BAR_HEIGHT : 0
      }}
    >
      <AnimatedSidebar
        ariaLabel="Primary navigation"
        collapsible="icon"
        role="navigation"
        variant="inset"
      >
        {panels?.left?.component}
      </AnimatedSidebar>

      <AnimatedSidebarInset
        className={cn(
          "min-w-24 overflow-hidden border-t border-neutral-200 dark:border-neutral-700 inset-ring-1 inset-ring-neutral-50 dark:inset-ring-black bg-white dark:bg-card rounded-lg!",
          `mx-0!`
        )}
      >
        <header className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <AnimatedSidebarTrigger>
              <MotionIcon name="PanelLeft" size={24} animation="press" />
            </AnimatedSidebarTrigger>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <AnimatedSidebarTrigger aria-label="Toggle panel" side="right">
              <MotionIcon name="PanelRight" size={24} animation="press" />
            </AnimatedSidebarTrigger>
          </div>
        </header>
        <div className="min-h-24 flex-1 overflow-auto">
          {children ?? <ShellLayoutPlaceholder />}
        </div>
      </AnimatedSidebarInset>

      <AnimatedSidebar
        ariaLabel={panels?.right?.name ?? "Secondary panel"}
        // Below md the panel is portal led over the page, so it carries the
        // surface itself; the desktop rail keeps it on the inner panel.
        className={cn("max-md:border-l max-md:border-neutral-200 max-md:bg-white dark:max-md:border-neutral-700 dark:max-md:bg-card")}
        collapsible="offcanvas"
        panelClassName={cn(
          // The off canvas panel keeps a fixed width so it can slide out of the
          // zero-width rail, so the inset gutter has to come out of that width
          // rather than from a left margin.
          "top-2 ml-0 h-[calc(100%-1rem)] min-w-[calc(var(--sidebar-width))]",
          "rounded-lg border-t border-neutral-200 bg-white shadow-md inset-ring-1 inset-ring-neutral-50",
          "dark:border-neutral-700 dark:bg-card dark:inset-ring-black"
        )}
        role="complementary"
        side="right"
        variant="inset"
      >
        {panels?.right?.component}
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
