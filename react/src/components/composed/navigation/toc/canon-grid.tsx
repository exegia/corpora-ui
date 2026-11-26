"use client"

import { useId, useState, type ReactNode, type Ref } from "react"
import { LayoutGroup } from "motion/react"
import { ArrowLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ToggleGroup } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipCreateHandle,
  TooltipPopup,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { CanonItem } from "./canon-item"
import { DefaultSection } from "./section"
import type { CanonContextMenuItems, TCanonItem } from "./type"

export interface CanonGridProps {
  size?: "sm" | "default"
  items: readonly TCanonItem[]
  selectedLink?: string
  onLinkClick?: (item: TCanonItem) => void
  contextMenuItems?: CanonContextMenuItems
  title?: ReactNode
  backLabel?: ReactNode
  onBack?: () => void
  headingRef?: Ref<HTMLHeadingElement>
  className?: string
}

/** Controlled canonical picker, suitable for a TOC or breadcrumb popover. */
export function CanonGrid({
  size = "default",
  items,
  selectedLink,
  onLinkClick,
  contextMenuItems,
  title,
  backLabel = "Back",
  onBack,
  headingRef,
  className,
}: CanonGridProps) {
  const scope = useId()
  const [tooltipHandle] = useState(() => TooltipCreateHandle<string>())
  return (
    <TooltipProvider>
      <section
        data-slot="canon-grid"
        data-size={size}
        className={cn("min-h-0 gap-2 flex flex-1 flex-col", className)}
      >
        {(title || onBack) && (
          <div className="pb-2 flex shrink-0 items-center justify-between">
            <h2
              ref={headingRef}
              tabIndex={-1}
              className={cn(
                "font-bold outline-none",
                size === "sm" && "text-sm"
              )}
            >
              {title}
            </h2>
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeftIcon aria-hidden="true" className="size-3" />
                {backLabel}
              </Button>
            )}
          </div>
        )}
        <ScrollArea
          scrollFade
          className="min-h-0 bg-neutral-1020 dark:bg-neutral-9520 h-auto flex-1 rounded-lg bg-transparent"
          overscrollContain
        >
          <div className="py-2">
            <LayoutGroup id={scope}>
              <ToggleGroup
                multiple={false}
                variant="outline"
                size={size === "sm" ? "sm" : "lg"}
                spacing={2}
                value={selectedLink ? [selectedLink] : []}
                onValueChange={({ value }) => {
                  const item = items.find((node) => node.link === value[0])
                  if (item) onLinkClick?.(item)
                }}
                className="gap-2 grid w-full grid-cols-5"
              >
                {items.map((item) =>
                  item.type === "section" ? (
                    <DefaultSection key={item.id} item={item} />
                  ) : (
                    <CanonItem
                      key={item.id}
                      size={size}
                      item={item}
                      active={selectedLink === item.link}
                      tooltipHandle={tooltipHandle}
                      contextMenuItems={contextMenuItems}
                      onLinkClick={() => {
                        if (selectedLink === item.link) onLinkClick?.(item)
                      }}
                    />
                  )
                )}
              </ToggleGroup>
            </LayoutGroup>
          </div>
        </ScrollArea>
      </section>
      <Tooltip handle={tooltipHandle}>
        {({ payload }) => <TooltipPopup>{payload}</TooltipPopup>}
      </Tooltip>
    </TooltipProvider>
  )
}
