"use client"

import { useState, type JSX } from "react"
import { cn } from "@/lib/utils"
import { DefaultSection } from "./section"
import type { CanonItemProps, ITocProps, TCanonItem } from "./types"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export function CanonItem({ item, onLinkClick }: CanonItemProps): JSX.Element {
  return (
      <ToggleGroupItem
          asChild
      onClick={() => onLinkClick?.(item)}
      className="min-w-0 p-0 aspect-square rounded-sm"

      key={item.id}
      value={item.link}
    >
      <span className={cn("text-sm")}>
        {item.type === "book" ? item.abbreviation : (item.number ?? item.label)}
      </span>
    </ToggleGroupItem>
  )
}

export function Canonical({
  items,
  activeLink,
  onLinkClick,
}: ITocProps<"canon">): JSX.Element {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set())
  const [selectedLink, setSelectedLink] = useState<string>()
  const selected = activeLink?.link ?? selectedLink

  const selectItem = (item: TCanonItem) => {
    setSelectedLink(item.link)
    if (item.nodes?.length) {
      setExpanded((current) => {
        const next = new Set(current)
        if (next.has(item.id)) next.delete(item.id)
        else next.add(item.id)
        return next
      })
    }
    if (onLinkClick) onLinkClick(item)
    else window.location.hash = item.link.slice(1)
  }

  const renderGroup = (nodes: readonly TCanonItem[]) => (
    <div>
      <ToggleGroup variant={"outline"} size={"lg"} spacing={2}>
        {nodes.map((item) => {
          if (item.type === "section")
            return <DefaultSection key={item.id} item={item} />
          return (
            <CanonItem
              key={item.id}
              item={item}
              active={selected === item.link}
              expanded={expanded.has(item.id)}
              onLinkClick={selectItem}
            />
          )
        })}
      </ToggleGroup>
    </div>
  )

  const sections = items.filter((item) => item.type === "section")
 
  const renderTabList = () => {
    return (
      <TabsList
        variant="underline"
        aria-label="Corpus sections"
        className="max-w-full overflow-x-auto"
      >
        {sections.map((section) => (
          <TabsTrigger key={section.id} value={section.id}>
            {section.label}
          </TabsTrigger>
        ))}
      </TabsList>
    )
  }
  const renderTabContent = () => {
    return sections.map((section) => (
      <TabsContent key={section.id} value={section.id}>
        <div className="gap-4 flex flex-col">
          {section.description && (
            <p className="text-xs text-muted-foreground">
              {section.description}
            </p>
          )}
          {section.nodes && renderGroup(section.nodes)}
        </div>
      </TabsContent>
    ))
  }

  return (
    <nav
      aria-label="Canonical table of contents"
      className="gap-3 flex h-full flex-col"
    >
      {sections.length ? (
        <Tabs defaultValue={sections[0]?.id}>
          {renderTabList()}
          {renderTabContent()}
        </Tabs>
      ) : null}
    </nav>
  )
}

export default Canonical
