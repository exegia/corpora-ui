"use client"

import { useMemo, useState, type JSX } from "react"
import { SearchIcon } from "lucide-react"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import { DefaultSection } from "./section"
import type { CanonItemProps, ITocProps, TCanonItem } from "./types"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group/index"
import { buttonVariants } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Kbd } from "@/ui"

export function CanonItem({ item, active, onLinkClick }: CanonItemProps): JSX.Element {
  return (
    <ToggleGroupItem
      value={item.link}

      data-slot="toggle-group-item"
      onClick={() => onLinkClick?.(item)}
      className={cn(
        buttonVariants({ variant: active ? "secondary" : "outline" }),
          "min-w-0 p-0 rounded-xs min-h-12 aspect-square h-auto w-full",
        active && "bg-current!"
      )}
    >
      <span className={cn("text-xs")}>
        {item.type === "book" ? item.abbreviation : (item.number ?? item.label)}
      </span>
    </ToggleGroupItem>
  )
}

export function Canonical({
  items,
  activeLink,
  description,
  onLinkClick,
}: ITocProps<"canon">): JSX.Element {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set())
  const [selectedLink, setSelectedLink] = useState<string>()
  const selected = useMemo(() =>  activeLink && activeLink.link ? [activeLink.link] : selectedLink ? [selectedLink] : [], [activeLink, selectedLink])

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
          <ToggleGroup
              multiple={false}
              variant={"outline"}
              value={selected}
        size={"lg"}
        spacing={2}
        className="gap-2 grid w-full grid-flow-row grid-cols-5 place-content-stretch place-items-stretch"
      >
        {nodes.map((item) => {
          if (item.type === "section")
            return <DefaultSection key={item.id} item={item} />
          return (
            <CanonItem
              key={item.id}
              item={item}
              active={selected.includes(item.link)}
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
        size="xs"
        aria-label="Corpus sections"
        className="mb-2 max-w-full overflow-x-auto"
      >
        {sections.map((section) => (
          <TabsTrigger size="xs" key={section.id} value={section.id}>
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
      className="gap-3 max-w-80 flex h-full flex-col"
    >
      <h1 className="text-lg font-bold">Table of Content</h1>
      {description && description}
      <InputGroup>
        <InputGroupInput
          size="lg"
          type="search"
          aria-label="Search books"
          placeholder="Search…"
        />
        <InputGroupAddon>
          <SearchIcon aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <Kbd>⌘K</Kbd>
        </InputGroupAddon>
      </InputGroup>

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
