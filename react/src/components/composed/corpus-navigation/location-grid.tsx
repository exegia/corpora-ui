"use client"

import { useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import { useAtomValue } from "jotai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { corpusNavigationDataAtom } from "./corpus-navigation-atom"
import {
  useCorpusNavigationActions,
  useCorpusNavigationState,
} from "./use-corpus-navigation-state"
import { anchorFor, indexCorpus } from "./utils"

export interface LocationGridProps {
  navigatorId: string
  levelId: string
}
const PAGE_SIZE = 60
const COLUMNS = 5
/** Bounded spatial picker: arrow focus never commits a reading location. */
export default function LocationGrid({
  navigatorId,
  levelId,
}: LocationGridProps) {
  const data = useAtomValue(corpusNavigationDataAtom(navigatorId))
  const { draft, location } = useCorpusNavigationState(navigatorId)
  const { select } = useCorpusNavigationActions(navigatorId)
  const [controls, setControls] = useState<{
    scope: string
    filter: string
    page: number | null
    focused: string | null
  }>({ scope: "", filter: "", page: null, focused: null })
  const root = useRef<HTMLDivElement>(null)
  if (!data) return null
  const level = data.schema.levels.find((item) => item.id === levelId)
  if (!level || level.kind !== "number") return null
  const depth = data.schema.levels.indexOf(level)
  const path = draft ? (indexCorpus(data).get(draft.nodeId)?.path ?? []) : []
  const parent = path.findLast(
    (node) =>
      data.schema.levels.findIndex((item) => item.id === node.level) < depth
  )
  const candidates = (parent?.children ?? data.nodes).filter(
    (node) => node.level === levelId
  )
  if (!candidates.length) return null
  const scope = JSON.stringify([
    data.corpusId,
    data.editionId,
    levelId,
    parent?.id,
  ])
  const defaults = { scope, filter: "", page: null, focused: null }
  const { filter, page, focused } =
    controls.scope === scope ? controls : defaults
  function updateControls(patch: Partial<typeof controls>) {
    setControls((previous) => ({
      ...(previous.scope === scope ? previous : defaults),
      ...patch,
    }))
  }
  const selected = path.find((node) => node.level === levelId)?.id
  const normalized = filter.trim().toLocaleLowerCase()
  const filtered = candidates.filter(
    (node) =>
      !normalized ||
      [node.label, node.reference, ...(node.aliases ?? [])].some((value) =>
        value?.toLocaleLowerCase().includes(normalized)
      )
  )
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const selectedPage = Math.max(
    0,
    Math.floor(filtered.findIndex((node) => node.id === selected) / PAGE_SIZE)
  )
  const activePage = Math.min(page ?? selectedPage, pages - 1)
  const visible = filtered.slice(
    activePage * PAGE_SIZE,
    (activePage + 1) * PAGE_SIZE
  )
  const current = location
    ? indexCorpus(data)
        .get(location.nodeId)
        ?.path.find((node) => node.level === levelId)?.id
    : undefined
  const tabStop =
    visible.find((node) => node.id === focused && !node.disabled)?.id ??
    visible.find((node) => node.id === selected && !node.disabled)?.id ??
    visible.find((node) => !node.disabled)?.id
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const buttons = Array.from(
      root.current?.querySelectorAll<HTMLButtonElement>("button[data-cell]") ??
        []
    )
    const index = buttons.indexOf(event.target as HTMLButtonElement)
    if (index < 0) return
    const rtl = data?.direction === "rtl"
    const offsets: Record<string, number> = {
      ArrowRight: rtl ? -1 : 1,
      ArrowLeft: rtl ? 1 : -1,
      ArrowDown: COLUMNS,
      ArrowUp: -COLUMNS,
    }
    let target =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? buttons.length - 1
          : event.key in offsets
            ? index + offsets[event.key]
            : undefined
    if (target === undefined) return
    event.preventDefault()
    const step = target < index ? -1 : 1
    while (target >= 0 && target < buttons.length && buttons[target].disabled)
      target += step
    buttons[target]?.focus()
  }
  return (
    <section
      className="space-y-3"
      aria-label={level.label}
      dir={data.direction}
    >
      <div className="gap-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">
          {level.label}
          {level.optional && (
            <span className="ms-1 font-normal text-muted-foreground">
              (optional)
            </span>
          )}
        </h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {candidates.length} available
        </span>
      </div>
      {candidates.length > 30 && (
        <Input
          aria-label={`Find ${level.label.toLocaleLowerCase()}`}
          placeholder={`Find ${level.label.toLocaleLowerCase()}…`}
          value={filter}
          onChange={(event) => {
            updateControls({
              filter: event.target.value,
              page: 0,
              focused: null,
            })
          }}
          className="**:data-[slot=input]:min-h-11"
        />
      )}
      <div
        ref={root}
        role="grid"
        aria-label={`${level.label} choices`}
        onKeyDown={onKeyDown}
        className="space-y-1"
      >
        {Array.from(
          { length: Math.ceil(visible.length / COLUMNS) },
          (_, row) => (
            <div role="row" key={row} className="gap-1 grid grid-cols-5">
              {visible
                .slice(row * COLUMNS, row * COLUMNS + COLUMNS)
                .map((node) => (
                  <div
                    role="gridcell"
                    key={node.id}
                    aria-selected={selected === node.id}
                  >
                    <Button
                      data-cell=""
                      variant={selected === node.id ? "default" : "outline"}
                      className="min-h-11 min-w-0 px-1 w-full tabular-nums"
                      disabled={node.disabled}
                      tabIndex={tabStop === node.id ? 0 : -1}
                      aria-label={`${level.label} ${node.label}`}
                      aria-current={
                        current === node.id ? "location" : undefined
                      }
                      onFocus={() => updateControls({ focused: node.id })}
                      onClick={() => select(anchorFor(data, node.id))}
                    >
                      <bdi>{node.label}</bdi>
                      {current === node.id && (
                        <span
                          className="size-1 shrink-0 rounded-full bg-current"
                          aria-hidden="true"
                        />
                      )}
                    </Button>
                  </div>
                ))}
            </div>
          )
        )}
      </div>
      {!visible.length && (
        <p role="status" className="text-sm text-muted-foreground">
          No matching {level.label.toLocaleLowerCase()}.
        </p>
      )}
      {pages > 1 && (
        <div className="gap-2 flex items-center justify-between">
          <Button
            variant="ghost"
            className="min-h-11"
            disabled={activePage === 0}
            onClick={() =>
              updateControls({ page: activePage - 1, focused: null })
            }
          >
            Previous range
          </Button>
          <span className="text-xs text-muted-foreground">
            {activePage + 1} / {pages}
          </span>
          <Button
            variant="ghost"
            className="min-h-11"
            disabled={activePage === pages - 1}
            onClick={() =>
              updateControls({ page: activePage + 1, focused: null })
            }
          >
            Next range
          </Button>
        </div>
      )}
    </section>
  )
}
