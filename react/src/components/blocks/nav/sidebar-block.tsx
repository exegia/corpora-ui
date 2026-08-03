"use client"

import { PanelLeftIcon } from "lucide-react"
import * as React from "react"

import {
  AnimatedSidebar,
  AnimatedSidebarContent,
  AnimatedSidebarFooter,
  AnimatedSidebarGroup,
  AnimatedSidebarGroupContent,
  AnimatedSidebarGroupLabel,
  AnimatedSidebarHeader,
  AnimatedSidebarMenu,
  AnimatedSidebarMenuButton,
  AnimatedSidebarMenuItem,
  AnimatedSidebarMenuSub,
  AnimatedSidebarMenuSubButton,
  AnimatedSidebarMenuSubItem,
  AnimatedSidebarProvider,
  AnimatedSidebarTrigger,
} from "@/components/motion/animated-sidebar"
import { cn } from "@/lib/utils"

/** A nested link, one level under a top-level entry. */
export interface SidebarNavSubItem {
  id: string
  label: string
  icon?: React.ReactNode
  /** Renders an anchor. Without one the row is a button. */
  href?: string
  disabled?: boolean
  target?: "_blank" | "_self" | "_parent" | "_top"
  onSelect?: () => void
}

/** A top-level entry. With `items` it expands instead of navigating. */
export interface SidebarNavItem extends SidebarNavSubItem {
  /** Trailing hint — a count, a "New" pill. Hidden while collapsed. */
  badge?: React.ReactNode
  items?: SidebarNavSubItem[]
  /** Start expanded. Defaults to expanded when one of its children is active. */
  defaultOpen?: boolean
}

/** A titled run of entries. The title hides while the rail is collapsed. */
export interface SidebarNavSection {
  id: string
  label?: string
  items: SidebarNavItem[]
}

export interface SidebarBlockProps {
  sections: SidebarNavSection[]
  /** `id` of the current entry — matches top-level and nested ids alike. */
  activeId?: string
  /** Fires for every selection, after the entry's own `onSelect`. */
  onNavigate?: (item: SidebarNavItem | SidebarNavSubItem) => void
  /** Brand row above the navigation. */
  header?: React.ReactNode
  /** Pinned below the navigation — an account card, a version note. */
  footer?: React.ReactNode
  /** Collapse toggle in the header row. */
  showTrigger?: boolean
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  /** How the rail collapses: to icons, off-canvas, or not at all. */
  collapsible?: "offcanvas" | "icon" | "none"
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Under 768px the panel is a drawer — drive it from your own header. */
  openMobile?: boolean
  defaultOpenMobile?: boolean
  onOpenMobileChange?: (open: boolean) => void
  /** Rail widths. CSS lengths, e.g. "16rem". */
  width?: string
  iconWidth?: string
  mobileWidth?: string
  ariaLabel?: string
  className?: string
}

function isActive(id: string, activeId?: string): boolean {
  return activeId !== undefined && id === activeId
}

interface RowProps {
  item: SidebarNavItem
  activeId?: string
  onNavigate?: (item: SidebarNavItem | SidebarNavSubItem) => void
}

function SidebarNavRow({ item, activeId, onNavigate }: RowProps) {
  const children = item.items ?? []
  const hasChildren = children.length > 0
  const childActive = children.some((child) => isActive(child.id, activeId))
  // null = follow the active child; a boolean = the reader has said otherwise.
  const [toggled, setToggled] = React.useState<boolean | null>(null)
  const [wasChildActive, setWasChildActive] = React.useState(childActive)

  // Navigating into a nested route from elsewhere reveals its parent, even if
  // the reader had collapsed it. Adjusted during render rather than in an
  // effect, so the group never paints closed for a frame first.
  if (childActive !== wasChildActive) {
    setWasChildActive(childActive)
    if (childActive) setToggled(null)
  }

  const open = toggled ?? item.defaultOpen ?? childActive

  function select(entry: SidebarNavItem | SidebarNavSubItem) {
    entry.onSelect?.()
    onNavigate?.(entry)
  }

  return (
    <AnimatedSidebarMenuItem>
      <AnimatedSidebarMenuButton
        ariaExpanded={hasChildren ? open : undefined}
        badge={item.badge}
        disabled={item.disabled}
        href={hasChildren ? undefined : item.href}
        icon={item.icon}
        isActive={isActive(item.id, activeId)}
        onSelect={() => {
          if (hasChildren) {
            setToggled(!open)
            return
          }
          select(item)
        }}
        target={item.target}
      >
        {item.label}
      </AnimatedSidebarMenuButton>
      {hasChildren ? (
        <AnimatedSidebarMenuSub open={open}>
          {children.map((child) => (
            <AnimatedSidebarMenuSubItem key={child.id}>
              <AnimatedSidebarMenuSubButton
                disabled={child.disabled}
                href={child.href}
                icon={child.icon}
                isActive={isActive(child.id, activeId)}
                onSelect={() => select(child)}
                target={child.target}
              >
                {child.label}
              </AnimatedSidebarMenuSubButton>
            </AnimatedSidebarMenuSubItem>
          ))}
        </AnimatedSidebarMenuSub>
      ) : null}
    </AnimatedSidebarMenuItem>
  )
}

/**
 * Application sidebar navigation, driven by data rather than composition.
 *
 * This is the navigation panel only — it claims no page layout, so place it
 * beside your own content. It owns its own sidebar context (⌘B toggles it);
 * pass `open`/`onOpenChange` to drive the rail, and `openMobile`/
 * `onOpenMobileChange` to open the drawer from a header button of your own.
 * Compose the underlying `AnimatedSidebar*` parts directly when a screen
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
}: SidebarBlockProps): React.ReactElement {
  return (
    <AnimatedSidebarProvider
      // The provider ships a full-page flex shell; this block is just the
      // panel, so the shell is flattened back to the panel's own box.
      className="h-full min-h-0 w-auto"
      defaultOpen={defaultOpen}
      defaultOpenMobile={defaultOpenMobile}
      onOpenChange={onOpenChange}
      onOpenMobileChange={onOpenMobileChange}
      open={open}
      openMobile={openMobile}
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
        {header || showTrigger ? (
          <AnimatedSidebarHeader>
            <div className="flex min-w-0 items-center justify-between gap-2">
              {header ? <div className="min-w-0 flex-1">{header}</div> : null}
              {showTrigger ? (
                <AnimatedSidebarTrigger className="text-muted-foreground hover:text-foreground">
                  <PanelLeftIcon className="size-4.5" />
                </AnimatedSidebarTrigger>
              ) : null}
            </div>
          </AnimatedSidebarHeader>
        ) : null}
        <AnimatedSidebarContent>
          {sections.map((section) => (
            <AnimatedSidebarGroup key={section.id}>
              {section.label ? (
                <AnimatedSidebarGroupLabel>
                  {section.label}
                </AnimatedSidebarGroupLabel>
              ) : null}
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
        {footer ? (
          <AnimatedSidebarFooter>{footer}</AnimatedSidebarFooter>
        ) : null}
      </AnimatedSidebar>
    </AnimatedSidebarProvider>
  )
}
