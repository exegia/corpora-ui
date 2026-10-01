"use client"

import { Fragment } from "react"
import { useAtomValue } from "jotai"
import { ChevronLeftIcon, ChevronRightIcon, MapPinIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { corpusNavigationDataAtom } from "./corpus-navigation-atom"
import {
  useCorpusNavigationActions,
  useCorpusNavigationState,
} from "./use-corpus-navigation-state"
import LocationPopover from "./location-popover"
import type { BreadcrumbItemOverlay } from "@/components/ui/breadcrumb"
import { adjacentAnchor, indexCorpus } from "./utils"

export interface LocationBarProps {
  navigatorId: string
  className?: string
  portalProps?: BreadcrumbItemOverlay["portalProps"]
}
/** Breadcrumbs preview ancestors. Previous/next are explicit committed jumps. */
export default function LocationBar({
  navigatorId,
  className,
  portalProps,
}: LocationBarProps) {
  const data = useAtomValue(corpusNavigationDataAtom(navigatorId))
  const { location, pending } = useCorpusNavigationState(navigatorId)
  const actions = useCorpusNavigationActions(navigatorId)
  if (!data) return null
  const path = location
    ? (indexCorpus(data).get(location.nodeId)?.path ?? [])
    : []
  const previous = adjacentAnchor(data, location, -1)
  const next = adjacentAnchor(data, location, 1)
  return (
    <div
      className={className}
      dir={data.direction}
      data-slot="corpus-location-bar"
    >
      <div className="min-w-0 gap-1 flex flex-wrap items-center">
        <Breadcrumb
          aria-label="Current reading location"
          className="min-w-0 flex-1"
        >
          <BreadcrumbList className="gap-0.5">
            {path.map((node, i) => (
              <Fragment key={`${data.corpusId}/${data.editionId}/${node.id}`}>
                {i > 0 && <BreadcrumbSeparator className="rtl:rotate-180" />}
                <LocationPopover
                  navigatorId={navigatorId}
                  data={data}
                  node={node}
                  current={i === path.length - 1}
                  portalProps={portalProps}
                />
              </Fragment>
            ))}
            {!path.length && (
              <BreadcrumbItem>
                <Button
                  variant="ghost"
                  className="min-h-11"
                  onClick={actions.openPicker}
                >
                  <MapPinIcon />
                  Choose location
                </Button>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <Button
          variant="ghost"
          className="min-h-11 min-w-11"
          aria-label="Previous location"
          disabled={!previous || pending}
          onClick={() => previous && void actions.commit(previous)}
        >
          <ChevronLeftIcon className="rtl:rotate-180" />
        </Button>
        <Button
          variant="ghost"
          className="min-h-11 min-w-11"
          aria-label="Next location"
          disabled={!next || pending}
          onClick={() => next && void actions.commit(next)}
        >
          <ChevronRightIcon className="rtl:rotate-180" />
        </Button>
      </div>
    </div>
  )
}
