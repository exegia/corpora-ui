import type {
  ISidebarNavItem,
  ISidebarNavSection,
  ISidebarNavSubItem,
} from "@/components/blocks/nav/types"


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
 // sections?: ISidebarNavSection[]
  //activeId?: string
//  onNavigate?: (item: ISidebarNavItem | ISidebarNavSubItem) => void
//  workspace?: ShellWorkspace
  //sidebarFooter?: React.ReactNode
 // topActions?: ShellAction[]
  //title?: React.ReactNode
  //eyebrow?: React.ReactNode
  //searchPlaceholder?: string
  //searchShortcut?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
 // openMobile?: boolean
  //defaultOpenMobile?: boolean
  //onOpenMobileChange?: (open: boolean) => void
  className?: string
   variant: 'web' | 'desktop'
  //sidebarClassName?: string
  //contentClassName?: string
}
