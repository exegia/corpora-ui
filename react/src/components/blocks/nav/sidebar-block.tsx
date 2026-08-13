"use client"

import { PanelLeftIcon } from "lucide-react"
import * as React from "react"

import {
  AnimatedSidebar,
  AnimatedSidebarHeader,


} from "@/components/motion/animated-sidebar"
import { cn } from "@/lib/utils"
import { SidebarNavRow } from "@/components/blocks/nav/sidebar-nav-row"

import type { ISidebarBlockProps } from "@/components/blocks/nav/types"
import { AnimatedSidebarProvider } from "@/components/motion/animated-panel-provider.tsx"
import { AnimatedSidebarTrigger } from "@/components/motion/animated-panel-trigger.tsx"
import { AnimatedSidebarContent } from "@/components/motion/animated-sidebar-content.tsx"
import { AnimatedSidebarFooter } from "@/components/motion/animated-sidebar-footer.tsx"
import { AnimatedSidebarGroup } from "@/components/motion/animated-sidebar-group.tsx"
import { AnimatedSidebarGroupLabel } from "@/components/motion/animated-sidebar-group-label.tsx"
import { AnimatedSidebarGroupContent } from "@/components/motion/animated-sidebar-group-content.tsx"
import { AnimatedSidebarMenu } from "@/components/motion/animated-sidebar-menu.tsx"

export type {
  ISidebarBlockProps as SidebarBlockProps,
  ISidebarNavItem as SidebarNavItem,
  ISidebarNavSection as SidebarNavSection,
  ISidebarNavSubItem as SidebarNavSubItem,
} from "@/components/blocks/nav/types"

/**
 * Application sidebar navigation, driven by data rather than composition.
 *
 * This is the navigation panel only — it claims no page layout, so place it
 * beside your own content. It owns its own sidebar context (⌘B toggles it);
 * pass `open`/`onOpenChange` to drive the rail, and `openMobile`/
 * `onOpenMobileChange` to open the drawer from a header button of your own.
 * Compose the underlying `AnimatedPanel*` parts directly when a screen
 * needs something this API does not cover.
 */
export function SidebarBlock({
  sections,
  activeId,
  onNavigate,
  header,
  footer,
  showTrigger = true,
  side = "left",
  variant = "sidebar",
  collapsible = "icon",
  open,
  defaultOpen,
  onOpenChange,
  openMobile,
  defaultOpenMobile,
  onOpenMobileChange,
  width,
  iconWidth,
  mobileWidth,
  ariaLabel = "Main",
  className,
}: ISidebarBlockProps): React.ReactElement {
  return (
    <AnimatedSidebarProvider
      // The provider ships a full-page flex shell; this block is just the
      // panel, so the shell is flattened back to the panel's own box. The
      // block is a single panel, so its scalar open props map onto the
      // provider's side-keyed records under the block's own `side`.
      className="h-full min-h-0 w-auto"
      defaultOpen={{ [side]: defaultOpen ?? true }}
      defaultOpenMobile={
        defaultOpenMobile === undefined ? undefined : { [side]: defaultOpenMobile }
      }
      onOpenChange={(nextOpen, changedSide) => {
        if (changedSide === side) onOpenChange?.(nextOpen)
      }}
      onOpenMobileChange={(nextOpen, changedSide) => {
        if (changedSide === side) onOpenMobileChange?.(nextOpen)
      }}
      open={open === undefined ? undefined : { [side]: open }}
      openMobile={openMobile === undefined ? undefined : { [side]: openMobile }}
      style={{
        ...(width ? { "--sidebar-width": width } : null),
        ...(iconWidth ? { "--sidebar-width-icon": iconWidth } : null),
        ...(mobileWidth ? { "--sidebar-width-mobile": mobileWidth } : null),
      }}
    >
      <AnimatedSidebar
        ariaLabel={ariaLabel}
        // The panel is built for a full-page shell (`h-svh`, so its footer
        // hangs below any shorter box). Fill the parent instead — in a
        // full-height layout that comes to the same thing.
        className={cn("h-full", className)}
        collapsible={collapsible}
        panelClassName="h-full"
        // The panel is navigation and nothing else, so it names a navigation
        // landmark rather than the complementary one <aside> implies. (The
        // mobile drawer is a dialog and keeps that role.)
        role="navigation"
        side={side}
        variant={variant}
      >
        {header ||
          (showTrigger && (
            <AnimatedSidebarHeader>
              <div className="flex min-w-0 items-center justify-between gap-2">
                {header && <div className="min-w-0 flex-1">{header}</div>}
                {showTrigger && (
                  <AnimatedSidebarTrigger className="text-muted-foreground hover:text-foreground">
                    <PanelLeftIcon className="size-4.5" />
                  </AnimatedSidebarTrigger>
                )}
              </div>
            </AnimatedSidebarHeader>
          ))}
        <AnimatedSidebarContent>
          {sections.map((section) => (
            <AnimatedSidebarGroup key={section.id}>
              {section.label && (
                <AnimatedSidebarGroupLabel>
                  {section.label}
                </AnimatedSidebarGroupLabel>
              )}
              <AnimatedSidebarGroupContent>
                <AnimatedSidebarMenu>
                  {section.items.map((item) => (
                    <SidebarNavRow
                      activeId={activeId}
                      item={item}
                      key={item.id}
                      onNavigate={onNavigate}
                    />
                  ))}
                </AnimatedSidebarMenu>
              </AnimatedSidebarGroupContent>
            </AnimatedSidebarGroup>
          ))}
        </AnimatedSidebarContent>
        {footer && <AnimatedSidebarFooter>{footer}</AnimatedSidebarFooter>}
      </AnimatedSidebar>
    </AnimatedSidebarProvider>
  )
}
