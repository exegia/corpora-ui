"use client"

import { useId, useMemo, useState, type JSX } from "react"
import { ToggleGroup as ArkToggleGroup } from "@ark-ui/react/toggle-group"
import { playCue } from "@/lib/sound"
import { LayoutGroup, motion, useReducedMotion } from "motion/react"
import {
  Tooltip,
  TooltipCreateHandle,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { SearchIcon } from "lucide-react"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import { DefaultSection } from "./section"
import type { CanonItemProps, ITocProps, TCanonItem } from "./types"
import { ToggleGroup } from "@/components/ui/toggle-group/index"
import { buttonVariants } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Kbd } from "@/ui"

type BookTooltipHandle = ReturnType<typeof TooltipCreateHandle<string>>

export function CanonItem({
  item,
  active,
  onLinkClick,
  tooltipHandle,
}: CanonItemProps & { tooltipHandle?: BookTooltipHandle }): JSX.Element {
  const reducedMotion = useReducedMotion()
  const content = (
    <>
      {active && (
        <motion.span
          aria-hidden="true"
          layoutId="canon-selection"
          initial={false}
          transition={{
            type: "spring",
            duration: reducedMotion ? 0 : 0.3,
            bounce: 0,
          }}
          className="inset-0 bg-stone-950 dark:bg-stone-100 pointer-events-none absolute rounded-sm bezel-dim-b-2 bezel-dim-blur-3 bezel-dim/78 bezel-lit-blur-2 bezel-lit-t-3 bezel-lit/14 dark:bezel-dim/50 dark:bezel-lit-blur-2 dark:bezel-lit/90"
        />
      )}
      <span className="text-xs relative z-10">
        {item.type === "book" ? item.abbreviation : (item.number ?? item.label)}
      </span>
    </>
  )
  const tile = (
    <ArkToggleGroup.Item
      value={item.link}
      data-slot="toggle-group-item"
      onClick={() => onLinkClick?.(item)}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "min-w-0 p-0 min-h-12 bg-stone-50 dark:bg-stone-950 relative isolate aspect-square h-auto w-full rounded-sm",
        active &&
          "text-white! dark:text-black! bg-transparent! hover:bg-transparent!"
      )}
    />
  )
  return tooltipHandle ? (
    <TooltipTrigger
      delay={0}
      handle={tooltipHandle}
      payload={item.label}
      render={tile}
    >
      {content}
    </TooltipTrigger>
  ) : (
    <ArkToggleGroup.Item {...tile.props}>{content}</ArkToggleGroup.Item>
  )
}

export function Canonical({
  items,
  activeLink,
  description,
  onLinkClick,
}: ITocProps<"canon">): JSX.Element {
  const reducedMotion = useReducedMotion()
  const layoutScope = useId()
  const [tooltipHandle] = useState(() => TooltipCreateHandle<string>())
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set())
  const [selectedLink, setSelectedLink] = useState<string>()
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
    if (selected[0] === item.link) return
    playCue("tick", { volume: 0.15 })
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
    else window.location.assign(item.link)
  }

  const renderGroup = (nodes: readonly TCanonItem[]) => (
    <LayoutGroup id={layoutScope}>
      <ToggleGroup
        multiple={false}
        variant={"outline"}
        value={selected}
        onValueChange={({ value }) => {
          const item = nodes.find((node) => node.link === value[0])
          if (item) selectItem(item)
        }}
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
              tooltipHandle={tooltipHandle}
              active={selected.includes(item.link)}
              expanded={expanded.has(item.id)}
            />
          )
        })}
      </ToggleGroup>
    </LayoutGroup>
  )

  const sections = items.filter((item) => item.type === "section")

  const renderTabList = () => {
    return (
      <TabsList
        variant="underline"
        size="xs"
        aria-label="Corpus sections"
        className="mb-2 [&_[data-slot=tab-indicator]]:bg-black! dark:[&_[data-slot=tab-indicator]]:bg-white! max-w-full overflow-x-auto"
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
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
          className="gap-4 flex flex-col"
        >
          {section.description && (
            <p className="text-xs text-muted-foreground">
              {section.description}
            </p>
          )}
          {section.nodes && renderGroup(section.nodes)}
        </motion.div>
      </TabsContent>
    ))
  }

  return (
    <TooltipProvider>
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
          <Tabs
            defaultValue={sections[0]?.id}
            onValueChange={() => playCue("whisper", { volume: 0.12 })}
          >
            {renderTabList()}
            {renderTabContent()}
          </Tabs>
        ) : null}
      </nav>
      <Tooltip handle={tooltipHandle}>
        {({ payload }) => <TooltipPopup>{payload}</TooltipPopup>}
      </Tooltip>
    </TooltipProvider>
  )
}

export default Canonical
