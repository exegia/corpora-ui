"use client"

import * as React from "react"

import type { IRowProps, ISidebarNavItem, ISidebarNavSubItem } from "@/components/blocks/nav/types"
import { isActive } from "@/components/blocks/nav/utils"
import { AnimatedSidebarMenuItem } from "@/components/motion/animated-sidebar-menu-item.tsx";
import { AnimatedSidebarMenuSub } from "@/components/motion/animated-sidebar-menu-sub.tsx"
import { AnimatedSidebarMenuSubItem } from "@/components/motion/animated-sidebar-menu-sub-item.tsx"
import { AnimatedSidebarMenuSubButton } from "@/components/motion/animated-sidebar-menu-sub-button.tsx"
import { AnimatedSidebarMenuButton } from "@/components/motion/animated-sidebar-menu-button.tsx"

export function SidebarNavRow({ item, activeId, onNavigate }: IRowProps) {
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

  function select(entry: ISidebarNavItem | ISidebarNavSubItem) {
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
