"use client"

import { MotionIcon } from "motion-icons-react"
import * as React from "react"

import { AnimatedPanel } from "./animated-panel.tsx"
import { cn } from "@/lib/utils"
import type { ShellLayoutProps, ShellPanelControlProps } from "./type"
import { TITLE_BAR_HEIGHT } from "./utils"
import type { ClassNameValue } from "tailwind-merge"
import { AnimatedPanelProvider } from "./animated-panel-provider.tsx"
import { AnimatedPanelTrigger } from "./animated-panel-trigger.tsx"
import { AnimatedPanelInset } from "./animated-panel-inset.tsx"

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
    <AnimatedPanelProvider
      {...panelControlProps}
      defaultOpen={initialOpen}
      className={cn(
        "relative h-full min-h-0 px-2 pb-2",
        variant === "web" && "pt-2",
        className,
        background
      )}
      style={{
        paddingTop: variant === "desktop" ? TITLE_BAR_HEIGHT : 0,
      }}
    >
      {panels?.left?.component && (
        <AnimatedPanel
          ariaLabel="Primary navigation"
          collapsible="icon"
          role="navigation"
          variant="inset"
        >
          {panels?.left?.component}
        </AnimatedPanel>
      )}

      <AnimatedPanelInset>
        <header className="flex h-12 flex-row! items-center justify-between gap-2 border-b px-2">
          {panels?.left?.component && (
            <div className="flex min-w-0 shrink-0 items-center justify-start gap-2">
              <AnimatedPanelTrigger side="left">
                <MotionIcon name="PanelLeft" size={24} animation="press" />
              </AnimatedPanelTrigger>
            </div>
          )}
          {header && (
            <div className="flex w-full flex-1 items-center">{header}</div>
          )}
          {panels?.right?.component && (
            <div className="flex w-full shrink items-center justify-end gap-2">
              <AnimatedPanelTrigger aria-label="Toggle panel" side="right">
                <MotionIcon
                  className="opacity-70"
                  name="PanelRight"
                  size={24}
                />
              </AnimatedPanelTrigger>
            </div>
          )}
        </header>
        <div className="min-h-24 flex-1 overflow-auto">{children}</div>
      </AnimatedPanelInset>

      {panels?.right?.component && (
        <AnimatedPanel
          ariaLabel={panels.right.name ?? "Secondary panel"}
          // Below md the panel is portal led over the page, so it carries the
          // surface itself; the desktop rail keeps it on the inner panel.
          className={cn(
            "bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900",
            "outline-offset-0.5 border-t-3 border-white outline-neutral-100 dark:inset-ring-black",
            "rounded-lg shadow-md shadow-neutral-200 dark:shadow-neutral-950"
          )}
          collapsible="offcanvas"
          role="complementary"
          side="right"
          variant="inset"
        >
          {panels.right.component}
        </AnimatedPanel>
      )}
    </AnimatedPanelProvider>
  )
}
