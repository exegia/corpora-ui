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
  header,
  defaultOpen,
  ...panelControlProps
}: ShellLayoutProps): React.ReactElement {

  const background: ClassNameValue = `bg-linear-to-tr/increasing from-neutral-200 via-neutral-100 to-stone-200 dark:from-neutral-900 dark:via-neutral-950 dark:to-stone-950`

  // Each panel seeds its own side's initial state (`defaultOpen ?? open`);
  // an explicit `defaultOpen` record — usually from useShellPanels — wins
  // per side.
  const initialOpen: ShellPanelControlProps["defaultOpen"] = {
      ...(panels?.left && {
        left: panels.left.defaultOpen ?? true,
      }),
      ...(panels?.right && {
        right: panels.right.defaultOpen ?? false,
      }),
      ...defaultOpen,
    }


  return (
    <AnimatedSidebarProvider
      {...panelControlProps}
      defaultOpen={initialOpen}
      className={cn(
        "relative block-full pr-2",
        className,
        background
      )}
      style={{
        paddingTop: variant === "desktop" ? TITLE_BAR_HEIGHT : 0,
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

      <AnimatedSidebarInset className="min-w-24">
        <header className="flex h-12 items-center justify-between gap-2 px-2">
          <div className="flex min-w-0 items-center gap-2">
            <AnimatedSidebarTrigger>
              {panels?.left?.trigger ?? (
                <MotionIcon name="PanelLeft" size={24} animation="press" />
              )}
            </AnimatedSidebarTrigger>
          </div>
          {header && <div className="flex flex-1 items-center">{header}</div>}
          <div className="flex shrink-0 items-center gap-2">
            <AnimatedSidebarTrigger aria-label="Toggle panel" side="right">
              {panels?.right?.trigger ?? (
                <MotionIcon className="opacity-70" name="PanelRight" size={24}  />
              )}
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
        className={cn(
          "max-md:border-l max-md:border-neutral-200 max-md:bg-white dark:max-md:border-neutral-700 dark:max-md:bg-card"
        )}
        collapsible="offcanvas"
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
    <div className="flex flex-col flex-1  p-4">
      <div className="h-96 border border-border bg-muted-foreground/10 rounded-lg" />
    </div>
  )
}
