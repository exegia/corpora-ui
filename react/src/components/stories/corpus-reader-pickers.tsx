"use client"

import { useEffect, useRef, useState } from "react"
import {
  BookText,
  ScrollText,
  SearchIcon,
  Check,
  ChevronDown,
} from "lucide-react"
import type { ApiTranslation } from "free-use-bible-api"
import { Button } from "@/components/ui/button"
import {
  Autocomplete,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteEmpty,
} from "@/components/ui/autocomplete"
import { Kbd } from "@/components/ui/kbd"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover"
import { TOC } from "@/components/composed/navigation"
import type { TCanonItem } from "@/components/composed/navigation/toc/type"
import {
  isReaderTranslation,
  translationPresentation,
} from "./translation-utils"
import { bibleApi } from "./toc.story"

export function ReaderLocationPicker({
  label,
  title,
  items,
  selectedLink,
  disabled,
  onSelect,
}: {
  label: string
  title: string
  items: readonly TCanonItem[]
  selectedLink?: string
  disabled?: boolean
  onSelect: (item: TCanonItem) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={<Button variant="ghost" size="sm" disabled={disabled} />}
        aria-label={title}
      >
        {label}
        <ChevronDown className="size-3" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverPopup align="start" aria-label={title}>
        <TOC.CanonGrid
          className="h-80 w-80 max-w-full"
          title={title}
          size="sm"
          items={items}
          selectedLink={selectedLink}
          onLinkClick={(item) => {
            setOpen(false)
            onSelect(item)
          }}
        />
      </PopoverPopup>
    </Popover>
  )
}

export function BibleTranslationPicker({
  selectedId,
  busy,
  selectionError,
  onSelect,
}: {
  selectedId: string
  busy: boolean
  selectionError?: string
  onSelect: (id: string) => void
}) {
  const [translations, setTranslations] = useState<readonly ApiTranslation[]>(
    []
  )
  const highlighted = useRef<ApiTranslation | undefined>(undefined)
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    bibleApi
      .getAvailableTranslations()
      .then(({ translations: next }) => {
        if (!active) return
        setTranslations(
          next
            .filter(
              (entry) =>
                entry.availableFormats.includes("json") &&
                isReaderTranslation(entry)
            )
            .sort(
              (a, b) =>
                Number(b.language === "eng") - Number(a.language === "eng") ||
                a.englishName.localeCompare(b.englishName)
            )
        )
      })
      .catch(() => {
        if (active) setError("Could not load Bible translations.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [attempt])
  const search = query.trim().toLocaleLowerCase()
  const matches = translations.filter((entry) =>
    [
      entry.id,
      entry.name,
      entry.englishName,
      entry.language,
      entry.languageEnglishName,
      entry.languageName,
    ].some((text) => text?.toLocaleLowerCase().includes(search))
  )
  return (
    <Autocomplete
      inline
      open
      items={matches.slice(0, 100)}
      filter={null}
      value={query}
      itemToStringValue={(entry: ApiTranslation) => entry.id}
      onValueChange={setQuery}
      onItemHighlighted={(entry) => {
        highlighted.current = entry
      }}
      onOpenChange={(_open, details) => {
        if (
          details.reason === "item-press" &&
          details.event.type === "keydown" &&
          highlighted.current &&
          !busy
        )
          onSelect(highlighted.current.id)
      }}
    >
      <div className="min-h-0 gap-3 p-4 flex flex-1 flex-col">
        <div className="relative">
          <AutocompleteInput
            aria-label="Search Bible translations"
            placeholder="Search name or language…"
            startAddon={<SearchIcon aria-hidden="true" />}
            className="[&_input]:pe-12"
            autoFocus
          />
          <Kbd className="right-2 pointer-events-none absolute top-1/2 -translate-y-1/2">
            ⌘K
          </Kbd>
        </div>
        {selectionError && (
          <p role="alert" className="text-sm text-destructive-foreground">
            {selectionError}
          </p>
        )}
        {loading ? (
          <div role="status" className="space-y-3">
            <span className="sr-only">Loading translations…</span>
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton
                key={i}
                aria-hidden="true"
                className="h-12 w-full motion-reduce:animate-none"
              />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="space-y-2 text-sm">
            <p>{error}</p>
            <Button
              variant="outline"
              onClick={() => {
                setError("")
                setLoading(true)
                setAttempt((value) => value + 1)
              }}
            >
              Try again
            </Button>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground" role="status">
              {matches.length > 100
                ? `Showing 100 of ${matches.length} translations. Refine your search for more.`
                : `${matches.length} translations`}
            </p>
            <AutocompleteList
              className="min-h-0 space-y-1"
              aria-label="Available translations"
              aria-busy={busy}
            >
              {(entry: ApiTranslation) => (
                <AutocompleteItem
                  key={entry.id}
                  value={entry}
                  onClick={() => {
                    if (!busy) onSelect(entry.id)
                  }}
                  className={`min-h-12 gap-2 py-2 h-auto w-full justify-start text-left whitespace-normal ${selectedId === entry.id ? "bg-accent" : ""}`}
                  disabled={busy}
                  aria-pressed={selectedId === entry.id}
                >
                  {translationPresentation(entry) === "manuscript" ? (
                    <ScrollText
                      className="mr-2 size-4 shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <BookText
                      className="mr-2 size-4 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block">{entry.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {entry.id} · {entry.languageEnglishName ?? entry.language}
                    </span>
                  </span>
                  {selectedId === entry.id && (
                    <Check className="size-4 shrink-0" aria-hidden="true" />
                  )}
                </AutocompleteItem>
              )}
            </AutocompleteList>
            <AutocompleteEmpty>
              No translations match your search.
            </AutocompleteEmpty>
          </>
        )}
      </div>
    </Autocomplete>
  )
}
