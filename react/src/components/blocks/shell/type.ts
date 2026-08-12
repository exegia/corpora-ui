import React from "react"

export interface ShellAction {
  id: string
  label: string
  icon: React.ReactNode
  badge?: React.ReactNode
  onSelect?: () => void
}

export interface ShellWorkspace {
  name: string
  logo?: React.ReactNode
  meta?: React.ReactNode
}

export interface ShellLayoutProps {
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Content of the right drawer. It has no icon rail — it is either fully
   * shown or fully hidden. */
  rightDrawer?: React.ReactNode
  rightOpen?: boolean
  defaultRightOpen?: boolean
  onRightOpenChange?: (open: boolean) => void
  className?: string
  variant: 'web' | 'desktop'
}
