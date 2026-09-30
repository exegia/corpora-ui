"use client"

import { useState, type JSX } from "react"
import { cn } from "@/lib/utils"
import { DefaultSection } from "./section"
import type { CanonItemProps, ITocProps, TCanonItem } from "./types"
import { getLabelText } from "./utils"
import { ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export function CanonItem({
  item,
  active = false,
  expanded,
  onLinkClick,
}: CanonItemProps): JSX.Element {
  return (
    <ToggleGroupItem
      aria-label={getLabelText(item.label, item.id)}
      aria-current={active ? "page" : undefined}
      aria-expanded={item.nodes?.length ? expanded : undefined}
      pressed={active}
      onClick={() => onLinkClick?.(item)}
      className="bg-amber-300"
      style={{
        width: "100%",
        height: "auto",
        minWidth: 0,
        aspectRatio: "1",
        padding: 0,
        borderRadius: "var(--radius-md)",
      }}
      key={item.id}
      value={item.link}
    >
      <span className={cn("text-lg")}>
        {item.type === "book" ? item.abbreviation : (item.number ?? item.label)}
      </span>
    </ToggleGroupItem>
  )
}

export function Canonical({
  items,
  activeLink,
  onLinkClick,
  renderSection,
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

  const renderItems = (nodes: readonly TCanonItem[]): JSX.Element => (
    <div className="gap-4 flex flex-col">
      {nodes
        .filter((item) => item.type === "section")
        .map((item) => (
          <section className="gap-4 flex flex-col" key={item.id}>
            {renderSection ? (
              renderSection(item)
            ) : (
              <DefaultSection item={item} />
            )}
            {item.nodes && renderItems(item.nodes)}
          </section>
        ))}
      {nodes.some((item) => item.type !== "section") && (
        <div
          className="grid grid-cols-5"
          style={{ gap: 4 }}
          data-slot="toc-canon-grid"
        >
          {nodes
            .filter((item) => item.type !== "section")
            .map((item) => (
              <CanonItem
                key={item.id}
                item={item}
                active={selected === item.link}
                expanded={expanded.has(item.id)}
                onLinkClick={selectItem}
              />
            ))}
        </div>
      )}
      {nodes
        .filter((item) => item.type !== "section" && expanded.has(item.id))
        .map((item) =>
          item.nodes?.length ? (
            <section
              className="gap-2 flex flex-col"
              key={item.id}
              aria-label={getLabelText(item.label, item.id)}
            >
              <DefaultSection item={item} />
              {renderItems(item.nodes)}
            </section>
          ) : null
        )}
    </div>
  )

  const sections = items.filter((item) => item.type === "section")
  const ungroupedItems = items.filter((item) => item.type !== "section")

  return (
    <nav
      aria-label="Canonical table of contents"
      className="gap-3 flex h-full flex-col"
    >
      {sections.length ? (
        <Tabs defaultValue={sections[0]?.id}>
          <TabsList
            aria-label="Corpus sections"
            className="max-w-full overflow-x-auto"
          >
            {sections.map((section) => (
              <TabsTrigger key={section.id} value={section.id}>
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {sections.map((section) => (
            <TabsContent key={section.id} value={section.id}>
              <div className="gap-4 flex flex-col">
                {renderSection ? (
                  renderSection(section)
                ) : section.description ? (
                  <p className="text-xs text-muted-foreground">
                    {section.description}
                  </p>
                ) : null}
                {renderItems(section.nodes ?? [])}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : null}
      {ungroupedItems.length ? renderItems(ungroupedItems) : null}
    </nav>
  )
}

export default Canonical
