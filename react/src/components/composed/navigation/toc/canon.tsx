"use client"

import { useEffect, useId, useMemo, useRef, type JSX } from "react"
import { playCue } from "@/lib/sound"
import { motion, useReducedMotion } from "motion/react"
import { Grid2X2Icon, SearchIcon } from "lucide-react"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import { CanonGrid } from "./canon-grid"
export { CanonItem } from "./canon-item"
import type { CanonProps, TCanonItem } from "./type"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Kbd } from "@/components/ui/kbd"
import { useCanonController } from "./use-canon"

export function Canonical({
  className,
  items,
  canonId,
  contextMenuItems,
  activeLink,
  description,
  onLinkClick,
}: CanonProps): JSX.Element {
  const reducedMotion = useReducedMotion()
  const layoutScope = useId()
  const {
    browseLink,
    browse,
    selectedLink,
    activeSectionId,
    select,
    setSection,
  } = useCanonController(
    canonId ?? layoutScope,
    activeLink?.link,
    canonId === undefined
  )
  const selected = useMemo(
    () =>
      activeLink && activeLink.link
        ? [activeLink.link]
        : selectedLink
          ? [selectedLink]
          : [],
    [activeLink, selectedLink]
  )

  const selectItem = (item: TCanonItem) => {
    if (item.nodes?.length) browse(item.link)
    else if (item.type === "book") browse(undefined)
    if (selected[0] === item.link && item.type !== "verse") return
    playCue("tick", { volume: 0.15 })
    select(item)
    if (onLinkClick) onLinkClick(item)
    else if (!item.nodes?.length) window.location.assign(item.link)
  }

  const sections = items.filter((item) => item.type === "section")
  const sectionId = sections.some((section) => section.id === activeSectionId)
    ? activeSectionId
    : sections[0]?.id
  // Publish the effective initial/fallback tab for remote store readers.
  useEffect(() => {
    if (activeSectionId !== sectionId) setSection(sectionId)
  }, [activeSectionId, sectionId, setSection])

  const renderTabList = () => {
    return (
      <TabsList
        variant="underline"
        size="sm"
        aria-label="Corpus sections"
        className="mb-2 **:data-[slot=tab-indicator]:bg-black! dark:**:data-[slot=tab-indicator]:bg-white! max-w-full shrink-0 overflow-x-auto"
      >
        {sections.map((section) => (
          <TabsTrigger size="xs" key={section.id} value={section.id}>
            {section.label}
          </TabsTrigger>
        ))}
      </TabsList>
    )
  }
  // Resolve against current data, so removed nodes never leave a stale detail view.
  const findPath = (
    nodes: readonly TCanonItem[],
    link: string
  ): TCanonItem[] => {
    for (const node of nodes) {
      if (node.link === link) return [node]
      const childPath = node.nodes && findPath(node.nodes, link)
      if (childPath?.length) return [node, ...childPath]
    }
    return []
  }
  const sectionNodes = sections.length
    ? (sections.find((section) => section.id === sectionId)?.nodes ?? [])
    : items
  const path = browseLink ? findPath(sectionNodes, browseLink) : []
  const parent = path.at(-1)
  const book = path.find((node) => node.type === "book")
  const bookIndex = sectionNodes.findIndex((node) => node.id === book?.id)
  const previousBook = sectionNodes[bookIndex - 1]
  const nextBook = sectionNodes[bookIndex + 1]
  const headingRef = useRef<HTMLHeadingElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const previousBrowse = useRef(browseLink)
  useEffect(() => {
    if (browseLink) headingRef.current?.focus({ preventScroll: true })
    else if (previousBrowse.current)
      navRef.current
        ?.querySelector<HTMLButtonElement>('[role="radio"]')
        ?.focus({ preventScroll: true })
    previousBrowse.current = browseLink
  }, [browseLink])
  const childType = parent?.nodes?.[0]?.type
  const gridLabel =
    childType === "verse"
      ? "Verses"
      : childType === "chapter"
        ? "Chapters"
        : "Contents"
  const renderNavigation = () => (
    <motion.div
      key={parent?.link ?? sectionId ?? "books"}
      initial={reducedMotion ? false : { opacity: 0, x: parent ? 12 : -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
      className="min-h-0 gap-3 flex flex-1 flex-col"
    >
      {parent && (
        <>
          <div className="gap-2 flex shrink-0 items-stretch">
            {previousBook && (
              <Button
                variant="outline"
                className="h-10 sm:h-10 w-12 px-1 text-xs sm:text-xs"
                aria-label={
                  previousBook
                    ? `Previous book: ${String(previousBook.label)}`
                    : "Previous book"
                }
                onClick={() => previousBook && selectItem(previousBook)}
              >
                {previousBook.abbreviation}
              </Button>
            )}
            <Button
              variant="default"
              className="h-10 sm:h-10 min-w-0 gap-2 px-2 text-xs sm:text-xs border-stone-800 dark:border-stone-300 bg-stone-950 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-black dark:hover:bg-white flex-1 justify-start"
              aria-label="Back to books"
              onClick={() => browse(undefined)}
            >
              <Grid2X2Icon aria-hidden="true" className="size-4 shrink-0" />
              <span className="min-w-0 text-left">
                <span className="font-bold block truncate">
                  {book?.label ?? parent.label}
                  {parent.type === "chapter" ? ` ${parent.number}` : ""}
                </span>
                <span className="font-normal leading-tight block text-[10px] opacity-75">
                  {parent.nodes?.length ?? 0} {gridLabel.toLowerCase()}
                </span>
              </span>
            </Button>
            {nextBook && (
              <Button
                variant="outline"
                className="h-10 sm:h-10 w-12 px-1 text-xs sm:text-xs"
                aria-label={
                  nextBook
                    ? `Next book: ${String(nextBook.label)}`
                    : "Next book"
                }
                onClick={() => nextBook && selectItem(nextBook)}
              >
                {nextBook.abbreviation}
              </Button>
            )}
          </div>
        </>
      )}
      <CanonGrid
        items={parent?.nodes?.length ? parent.nodes : sectionNodes}
        selectedLink={selected[0]}
        onLinkClick={selectItem}
        contextMenuItems={contextMenuItems}
        title={parent ? gridLabel : undefined}
        headingRef={headingRef}
        onBack={parent ? () => browse(path.at(-2)?.link) : undefined}
        backLabel={path.length > 1 ? "Chapters" : "Books"}
      />
    </motion.div>
  )

  return (
    <nav
      ref={navRef}
      aria-label="Canonical table of contents"
      className={cn(
        "gap-3 max-w-80 min-h-0 flex h-full flex-col overflow-hidden",
        className
      )}
    >
      <h1 className="text-lg font-bold shrink-0">Table of Content</h1>
      {description && description}
      <InputGroup className="shrink-0">
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
        <Tabs
          className="min-h-0 flex-1"
          value={sectionId}
          onValueChange={({ value }) => {
            setSection(value)
            playCue("whisper", { volume: 0.12 })
          }}
        >
          {renderTabList()}
          {sections.map((section) => (
            <TabsContent
              className="min-h-0 flex flex-1 flex-col"
              key={section.id}
              value={section.id}
            >
              {section.id === sectionId && renderNavigation()}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        renderNavigation()
      )}
    </nav>
  )
}

export default Canonical
