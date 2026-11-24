"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { usePathname } from "fumadocs-core/framework"
import { useTreePath } from "fumadocs-ui/contexts/tree"
import { Sidebar, type SidebarProps } from "fumadocs-ui/layouts/docs/slots/sidebar"
import type { Folder } from "fumadocs-core/page-tree"
import { ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const CategoryContext = createContext<{
  selected: string | null | undefined
  select: (name: string | null) => void
}>({ selected: undefined, select: () => {} })

function Category({ item, children }: { item: Folder; children: ReactNode }) {
  const { selected, select } = useContext(CategoryContext)
  const path = useTreePath()
  const name = item.$id ?? String(item.name)
  const open = selected === undefined ? path.includes(item) : selected === name
  return (
    <Collapsible open={open} onOpenChange={(value) => select(value ? name : null)}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start text-sm text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-2 focus-visible:outline-fd-ring [&>svg]:size-4">
        {item.icon}{item.name}
        <ChevronDown aria-hidden className={`ms-auto size-4 transition-transform ${open ? "" : "-rotate-90"}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="ms-2 border-s ps-2 motion-reduce:transition-none">
        {item.index && <a href={item.index.url} className="block px-2 py-1.5 text-sm">Overview</a>}
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

/** Share one open category across desktop and drawer navigation. */
export function DocsSidebar(props: SidebarProps) {
  const pathname = usePathname()
  const [choice, setChoice] = useState<{ pathname: string; name: string | null }>()
  return (
    <CategoryContext value={{
      selected: choice?.pathname === pathname ? choice.name : undefined,
      select: (name) => setChoice({ pathname, name }),
    }}>
      <Sidebar {...props} components={{ ...props.components, Folder: Category }} />
    </CategoryContext>
  )
}
